import {Client} from "@elastic/elasticsearch";
import {SearchResponse} from "@elastic/elasticsearch/lib/api/types";

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

    // Scroll retrieve large numbers of results from a single search query.
    // It returns a list containing the whole SearchResponse.
    async Scroll<T>(
        index: string,
        query: any
    ): Promise<SearchResponse<T>[]> {
        let total: number = 0;
        const results: SearchResponse<T>[] = [];

        const res = await this.client.search<T>({
            index: index,
            scroll: "30s",
            body: query
        });
        results.push(res);

        while (results.length > 0) {
            const res = results[results.length - 1];
            total += res.hits.hits.length;
            // @ts-ignore
            if (res.hits.total.value === total) {
                break;
            }
            results.push(
                await this.client.scroll({
                    scroll_id: res._scroll_id,
                    scroll: "30s"
                })
            );
        }
        return results;
    }

    // GetClient returns the elasticsearch client and please notice the client may be empty.
    GetClient() {
        return this.client;
    }
}

export default Elasticsearch;
