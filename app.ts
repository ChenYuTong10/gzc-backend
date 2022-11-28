import dotenv from 'dotenv';
import express, { Express } from 'express';
import { createLogger, format, transports } from "winston";
const { combine, timestamp } = format;
import { Postgres, Elasticsearch } from "./database";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

// -------------------- LOGGER --------------------

export const logger = createLogger({
    // Log only if info.level is less than or equal to this level.
    // The following is the level layout in winston package from most important to least important.
    // error: 0 => warn: 1 => info: 2 => http: 3 => ...
    // Thus, only error, warn and info will be logged. More to see https://github.com/winstonjs/winston#creating-your-own-logger.
    level: "info",
    // combine will merge multiple formats into a final one. Like the following, for example,
    // the final one will be like '{}'
    format: combine(
        timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    exitOnError: false
});

if (process.env.MODE === "dev") {
    logger.add(new transports.Console());
}

if (process.env.MODE === "prod") {
    logger.add(new transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 512, maxFiles: 10 }));
    logger.add(new transports.File({ filename: 'logs/warn.log', level: 'warn', maxsize: 512, maxFiles: 10 }));
    logger.add(new transports.File({ filename: 'logs/info.log', level: 'info', maxsize: 512, maxFiles: 10 }));
// Maybe there are some unexpected error occurs.
    logger.exceptions.handle(new transports.File({ filename: "logs/fatal.log" }));
}

// -------------------- ELASTICSEARCH --------------------

const es_addrs = process.env.ES_ADDRS || "localhost:9200";
const es_username = process.env.ES_USERNAME || "elastic";
const es_password = process.env.ES_PASSWORD || "123456";

export const es = new Elasticsearch([es_addrs], es_username, es_password);
logger.log({ level: "info", message: `📡 [elasticsearch]: Connect elasticsearch node at ${es_addrs}`});
es.GetInfo()
    .then(res => {
        logger.log({ level: "info", message: `✅ [elasticsearch]: Elasticsearch node info`, info: res });
    })
    .catch(err => {
        logger.log({ level: "error", message: `❌ [elasticsearch]: Elasticsearch node response error`, err: err.message });
    });

// -------------------- POSTGRES --------------------

const pg_host = process.env.PG_HOST || "localhost";
const pg_port = parseInt(process.env.PG_PORT || "5432");
const pg_username = process.env.PG_USERNAME || "corpus";
const pg_password = process.env.PG_PASSWORD || "123456";
const pg_dbname = process.env.PG_DBNAME || "corpus";

export const pg = new Postgres(pg_host, pg_port, pg_username, pg_password, pg_dbname);
logger.log({ level: "info", message: `📡 [postgresql]: Connect postgresql instance at ${pg_host}:${pg_port}`});
pg.Ping()
    .then(res => {
        logger.log({ level: "info", message: `✅ [postgresql]: Postgresql instance version`, version: res });
        app.listen(port, () => {
            logger.log({ level: "info", message: `⚡ [server]: Server is running at http://localhost:${port}` });
        });
    })
    .catch(err => {
        logger.log({ level: "error", message: `❌ [postgresql]: Postgresql instance response error`, err: err.message });
    });

// -------------------- ROUTER --------------------
import { SearchKeyword } from "./handler/MatchKeyword";
import { GetItemDetails } from "./handler/GetItemDetails";
import {DownloadDocs} from "./handler/DownloadDocs";

app.use(express.json());

app.post("/api/search", SearchKeyword);
app.get("/api/details", GetItemDetails);
app.post("/api/download", DownloadDocs);