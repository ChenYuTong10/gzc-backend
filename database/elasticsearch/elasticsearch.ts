import {Client} from "@elastic/elasticsearch";
import {SearchHit, SearchTotalHits} from "@elastic/elasticsearch/lib/api/types";

class Elasticsearch {

    addrs: string[]
    username: string
    password: string
    client: Client

    constructor(
        _addrs: string[],
        _username: string,
        _password: string
    ) {
        this.addrs = _addrs;
        this.username = _username;
        this.password = _password;

        this.client = new Client({
            nodes: _addrs,
            auth: {
                username: _username,
                password: _password
            }
        });
    }

    async GetInfo() {
        return await this.client.info();
    }

    // MatchKeyword returns the hits and total after the searching documents from elasticsearch.
    // If you want to get other information or customize something, using GetClient instead.
    async MatchKeyword<T>(
        index: string,
        query: any
    ) {
        const res = await this.client.search<T>({
            index: index, body: query,
        });
        return {hits: res.hits.hits, total: res.hits.total};
    }

    // GetDocument returns the specific document with id. You can appoint the source field.
    async GetDocument<T>(
        index: string,
        _id: string,
        _source?: string[]
    ) {
        const query: any = {query: {term: {_id: _id}}};
        if (_source) {
            query["_source"] = _source;
        }
        const res = await this.client.search<T>({index, body: query});
        const {hits} = res.hits;
        return hits.length > 0 ? hits[0] : null;
    }

    // GetClient returns the elasticsearch client and please notice the client may be empty.
    GetClient() {
        return this.client;
    }
}

export default Elasticsearch;
