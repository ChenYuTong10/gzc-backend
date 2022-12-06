import {Request, Response} from "express";
import {es, logger} from "../app";
import {SearchItem} from "./Interfaces";

export async function DownloadDocs(req: Request, res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
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
            size: 100,
            query: {
                bool: {
                    must: must
                }
            },
            _source: ["_id"],
            highlight: {
                fields: {
                    [searchOption.show]: {
                        fragmenter: "simple",
                        number_of_fragments: 1,
                        pre_tags: "",
                        post_tags: ""
                    }
                }
            }
        };
        const scroll = await es.Scroll<SearchItem>(searchOption.target, query);

        const regex = new RegExp(`.\{${searchOption.limit}\}${searchOption.keyword}.\{${searchOption.limit}\}`, "im");
        let total: number = 1;
        const texts: string[] = [];
        scroll.forEach(page => {
            const hits = page.hits.hits;

            hits.forEach(hit => {
                if (!hit) {
                    return;
                }

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
                texts.push(`${total++}\t${result[0]}\n`);
            });
        });

        res.send(texts.join(""));
    }
    catch (err: any) {
        logger.log({level: "error", message: "unexpected error when getting document", err: err.message});
        res.status(500).send(err.message);
    }
}