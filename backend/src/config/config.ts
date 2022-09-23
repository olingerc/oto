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
        backendAllowedOrigins: process.env.BACKEND_ALLOWED_ORIGINS,//.split(","), // webpack dev server runs on 8080

        /*
         * DATABASE CONFIG
         */
        mongoDbHost: process.env.MONGODB_HOST, // as given by docker-compose
        mongoDbName: process.env.MONGODB_NAME,
        mongoDbAuthString: "",
        /*
         * ROUTE AUTHENTICATION WEB TOKEN
         */
        superSecret: "",

        debug: process.env.DEBUG

      };
      const MONGODB_USER = fs.readFileSync("/run/secrets/MONGODB_USER").toString().trim();
      const MONGODB_PW = fs.readFileSync("/run/secrets/MONGODB_PW").toString().trim();

      // Set mongodb authstring
      if (MONGODB_USER && MONGODB_PW)  {
        env_config.mongoDbAuthString = MONGODB_USER + ":" + MONGODB_PW + "@";
      }

      env_config.superSecret = fs.readFileSync("/run/secrets/WEBTOKEN_SECRET").toString().trim();

      // Compile based on env
      let compiled: any = {

        // DB
        db: `mongodb://${env_config.mongoDbAuthString}${env_config.mongoDbHost}/${env_config.mongoDbName}`,
      };


      // Combine
      _.extend(
        compiled,
        env_config,
        common
      );

    return _.cloneDeep(compiled);
};
