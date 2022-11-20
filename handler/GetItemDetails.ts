import {es, pg, logger} from "../app";
import {Request, Response} from "express";

interface DocumentDetails {
    head: string;
    tags: string[];
    body: string;
    analyzed: string;
}

interface FreqTable {
    word: string;
    freq: number;
}

export async function GetItemDetails(req: Request, res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Method", "GET, POST");
    try {
        const documentId: string = req.query["id"] as string;

        // get whole document
        const document = await es.GetDocument<DocumentDetails>(
            "qianziwen", documentId,
            ["head", "tags", "body"]
        );
        if (!document || !document._source) {
            res.status(400).send("no such document");
            return;
        }

        // get analyzed data
        const analyzed = await pg.GetAnalyzedData(documentId);
        if (analyzed.rows.length <= 0) {
            res.status(400).send("no such document");
            return;
        }
        const row = analyzed.rows[0];

        const result = {
            _id: documentId,
            document: {
                head: document._source["head"],
                body: document._source["body"],
                tags: document._source["tags"]
            },
            analyzed: {
                CTT: Object.entries<number>(row["char_type_table"])
                    .sort(([,a], [,b]) => b - a).slice(0, 10)
                    .reduce<FreqTable[]>((r, [k, v]) => ([...r, { word: k, freq: v }]), []),
                CTC: row["char_type_count"],
                TTT: Object.entries<number>(row["term_type_table"])
                    .sort(([,a], [,b]) => b - a).slice(0, 10)
                    .reduce<FreqTable[]>((r, [k, v]) => ([...r, { word: k, freq: v }]), []),
                TTC: row["term_type_count"],
                BL: row["body_len"],
                ASL: row["avg_sentence_len"],
                APL: row["avg_paragraph_len"]
            }
        };

        res.send(result);
    } catch (err: any) {
        logger.log({level: "error", message: "unexpected error when getting document", err: err.message});
        res.status(500).send(err.message);
    }
}