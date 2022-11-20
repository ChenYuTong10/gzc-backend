import {es, logger} from "../app";
import {Request, Response} from 'express';

interface SearchItem {
    id: string;
    author: string;
    document: string;
}

export async function SearchKeyword(req: Request, res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Method", "GET, POST");
    try {
        const searchOption = req.body;

        // TODO: you must check the request parameters here.

        const must: any[] = [{bool: {must: [{match: {[searchOption.show]: searchOption.keyword}}]}}];
        if (searchOption.grades.length > 0) {
            const should: any[] = [];
            searchOption.grades.forEach((grade: any) => {
                should.push({term: {grade}});
            });
            must.push({bool: {should}});
        }
        if (searchOption.genres.length > 0) {
            const should: any[] = [];
            searchOption.genres.forEach((genre: any) => {
                should.push({term: {genre}});
            });
            must.push({bool: {should}});
        }
        if (searchOption.tags.length > 0) {
            const should: any[] = [];
            searchOption.genres.forEach((genre: any) => {
                should.push({match: {genre}});
            });
            must.push({bool: {should: should}});
        }

        const query = {
            from: (searchOption.page - 1) * searchOption.size,
            size: searchOption.size,
            query: {
                bool: {
                    must: must
                }
            },
            _source: ["author", "_id"],
            highlight: {
                fields: {
                    body: {
                        fragmenter: "simple",
                        number_of_fragments: 1,
                        pre_tags: "",
                        post_tags: ""
                    }
                }
            }
        };
        const {hits, total} = await es.MatchKeyword<SearchItem>(searchOption.target, query);

        const regex = new RegExp(`.\{${searchOption.limit}\}${searchOption.keyword}.\{${searchOption.limit}\}`, "g");
        const docs: SearchItem[] = [];
        hits.forEach(hit => {
            if (!hit) {
                return;
            }
            const id: string = hit._id;

            if (!hit._source) {
                return;
            }
            const author = hit._source["author"];

            const highlight = hit.highlight;
            if (!highlight) {
                return;
            }
            const fragments = highlight[searchOption.show];
            if (fragments.length <= 0) {
                return;
            }
            const result = regex.exec(fragments[0]);
            if (!result) {
                return;
            }
            const document: string = result[0];

            docs.push({id, author, document});
        });

        res.send({total, docs});
    } catch (err: any) {
        logger.log({level: "error", message: "unexpected error when searching keyword", err: err.message});
        res.status(500).send(err.message);
    }

}