import http from 'http';
import https from 'https';

import { configFunc } from '../../config/config';

const config = configFunc();

function apiCall(options, callback) {
  let output = '';
  const port = options.port == 443 ? https : http;
  const req = port.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      output += chunk;
    });
    res.on('end', () => {
      let obj = JSON.parse(output);
        callback(null, res.statusCode, obj);
    });
  });

  req.on('error', (err) => {
    callback('error: ' + err.message);
  });

  req.end();
};


let api = {
  "status":  function(req, res) {
      
    const printerStatus = {
      host: '192.168.178.52',
      port: 80,
      path: '/api/printer',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.prusaApiKey,
      }
    };

    const currentJob = {
      host: '192.168.178.52',
      port: 80,
      path: '/api/job',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.prusaApiKey,
      }
    };

    // TODO: no callback hell' async await !
    apiCall(printerStatus, (printerStatusError, statusCode, printerStatusResult) => {
      if (printerStatusError) {
        return res.status(500).json(printerStatusError);
      } else {

        apiCall(currentJob, (currentJobError, statusCode, currentJobResult) => {
          if (currentJobError) {
            return res.status(500).json(currentJobError);
          } else {
            res.status(200).json({
              "status": printerStatusResult,
              "job": currentJobResult
            });
          }
        });
      }
    });
  }
}

export = api;