/*jslint node: true */
import fs from "fs";

import _ from 'lodash';
import { env } from "process";

const common = {
};

export const configFunc: any = function() {

    let env_config = {
        /*
        * NODE BACKEND API SERVER CONFIG
        */
        port: 5000,

        
        /*
         * CORS ALLOWED ORIGINS
         * neeed for backend to accept stuff from frontend
         */
        backendAllowedOrigins: process.env.CORS_ALLOWED,

        /*
         * DATABASE CONFIG
         */
        pgHost: process.env.POSTGRES_HOST, // as given by docker-compose
        pgPort: process.env.POSTGRES_PORT, // as given by docker-compose
        pgDB: process.env.POSTGRES_DB,
        pgUser: "",
        pgPw: "",
        /*
         * ROUTE AUTHENTICATION WEB TOKEN
         */
        superSecret: "",

        debug: process.env.DEBUG,
        nodeEnv: process.env.NODE_ENV,
        prusaApiKey: ""
      };

      env_config.pgUser = fs.readFileSync("/run/secrets/POSTGRES_USER").toString().trim();
      env_config.pgPw = fs.readFileSync("/run/secrets/POSTGRES_PW").toString().trim();
      env_config.superSecret = fs.readFileSync("/run/secrets/WEBTOKEN_SECRET").toString().trim();
      env_config.prusaApiKey = fs.readFileSync("/run/secrets/PRUSAAPIKEY").toString().trim();

      // Compile based on env
      let compiled: any = {

      };


      // Combine
      _.extend(
        compiled,
        env_config,
        common
      );

    return _.cloneDeep(compiled);
};
