"use strict";
const path = require("path");

module.exports = appInfo => {
  return {
    cluster: {
      listen: {
        port: 9998,
        workers: 1
      }
    },
    keys: appInfo.name + "_test",
    logger: {
      consoleLevel: "warn",
      level: "warn",
      dir: path.join(appInfo.baseDir, "logs")
    },
    logrotator: {
      maxDays: 3
    },
    mysql: {
      clients: {
        user: {
          database: "lm_user"
        },
        rank: {
          database: "lm_rank"
        }
      },
      default: {
        host: "localhost",
        port: "3306",
        user: "root",
        password: "password",
        supportBigNumbers: true
      }
    },
    session: {
      key: "lm",
      maxAge: 7 * 24 * 3600 * 1000
    },
    middleware: [],
    redis: {
      client: {
        host: "localhost",
        port: 6379,
        password: "password",
        db: 0
      }
    }
  };
};
