/*jslint node: true */

import node_path from 'path';
import child_process from 'child_process';
import fs from 'fs-extra';

import async from 'async';
import _ from 'lodash';

import * as utils from '../../utils/utils';
import { configFunc } from '../../config/config';

const execFile = child_process.execFile;
const config = configFunc();

let fileexplorer: any = {
  listdir: function(req, res) {
    /**
     * Incoming and outgoing paths are relative to root wihout leading slashes
     */
    let req_root_code = req.query.root_code.toUpperCase(); //no trailing slash
    let req_path = req.query.path;
    let folders = [];
    let files = [];
    let path = [];
    let exluded_folders = config.exclude_fileexplorer_folders;
    let limitToPath = req.query.limitToPath;

    if (limitToPath && limitToPath != undefined && limitToPath != "undefined") {
      if (!req_path.startsWith(limitToPath)) {
        req_path = limitToPath + "/" + req_path;
      }
    }

    let fullPath = config.WORKSTATION_PATHS[req_root_code] + '/' + req_path;
    if (fullPath[fullPath.length - 1] == '/') {
      fullPath = fullPath.substr(0, fullPath.length - 1);
    }

    execFile('find', [fullPath, '-maxdepth', '1'], {
      maxBuffer: 200 * 1024 * 1000
    }, function(err, stdout, stderr) {
      if (err) {
        console.log(err)
        res.status(500).json({message: 'Error reading ' + fullPath});
        return;
      }
      let files_list = stdout.split('\n');
      //Files and folders
      files_list.shift();
      files_list.pop();
      async.map(
        files_list,
        function(file, callback) {
          let relativePath = req_path + '/' + node_path.basename(file);
          if (relativePath[0] == '/') {
            relativePath = relativePath.substr(1);
          }

          fs.stat(file, function(err, stats) {
            if (err) {
              callback(err, null);
            } else {
              let basename = node_path.basename(file);
              if (exluded_folders.indexOf(basename) === -1) {
                if (stats.isDirectory()) {
                  folders.push({
                    'type': 'folder',
                    'folder': basename,
                    'path': relativePath,
                    'rootCode': req_root_code,
                    'serverEncodedPath': '#' + req_root_code + '#/' + relativePath
                  });
                } else {
                  files.push({
                    'type': 'file',
                    'basename': utils.bioseqNoExtension(node_path.basename(file)),
                    'fileName': basename,
                    'path': relativePath,
                    'rootCode': req_root_code,
                    'serverEncodedPath': '#' + req_root_code.toUpperCase() + '#/' + relativePath
                  });
                }
              }
              callback(null, null);
            }
          });
        },
        function(err, results) {
          if (err) {
            res.status(500).json({message: err});
          } else {
            //Build current dir path
            let cum = [];
            _.each(req_path.split('/'), function(dir) {
              if (dir) {
                cum.push(dir);
                path.push({
                  'final': dir,
                  'path': cum.join('/')
                });
              }
            });
            let response = {
              folders: _.sortBy(folders, function(item) {
                return item.folder;
              }),
              files: _.sortBy(files, function(item) {
                return item.fileName;
              }),
              path: path
            };
            res.status(200).json(response);
          }
        });
    });
  },
  downloadFile: function(req, res) {
    let rootCode = req.query.rootCode;
    let filePath = req.query.path;
  
    let path = config.WORKSTATION_PATHS[rootCode.toUpperCase()] + '/' + filePath;
    if (fs.pathExistsSync(path)) {
      res.sendfile(path);
    } else {
      res.status(404).json({message: 'File does not exist'});
    }
  },
};

export = fileexplorer;
