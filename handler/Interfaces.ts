
export interface SearchItem {
    id: string;
    author: string;
    document: string;
}

export interface DocumentDetails {
    head: string;
    tags: string[];
    body: string;
    analyzed: string;
}

export interface FreqTable {
    word: string;
    freq: number;
}