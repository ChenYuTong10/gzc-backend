import {Pool} from "pg";


class Postgres {

    host: string
    port: number
    username: string
    password: string
    dbname: string
    pool: Pool

    constructor(
        _host: string,
        _port: number,
        _username: string,
        _password: string,
        _dbname: string
    ) {
        this.host = _host;
        this.port = _port;
        this.username = _username;
        this.password = _password;
        this.dbname = _dbname;

        this.pool = new Pool({
            host: _host,
            port: _port,
            user: _username,
            password: _password,
            database: _dbname,
        });
    }

    async Ping() {
        return await this.pool.query("SELECT VERSION();");
    }

    // GetAnalyzedData returns
    async GetAnalyzedData(documentId: string) {
        return await this.pool.query("SELECT * FROM analyzed where id = $1", [documentId]);
    }
}

export default Postgres;
