/* PostgreSQL 14.5 on x86_64-pc-linux-musl, compiled by gcc (Alpine 11.2.1_git20220219) 11.2.1 20220219, 64-bit */

-- https://stackoverflow.com/questions/24918367/grant-privileges-for-a-particular-database-in-postgresql

REVOKE ALL ON DATABASE corpus FROM public;

GRANT CONNECT ON DATABASE corpus TO corpus_manager;

GRANT USAGE ON SCHEMA public TO corpus_manager;

GRANT ALL ON ALL TABLES IN SCHEMA public TO corpus_manager;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO corpus_manager;

ALTER DEFAULT PRIVILEGES FOR ROLE corpus_manager IN SCHEMA public GRANT ALL ON TABLES TO corpus_manager;

GRANT corpus_manager TO corpus_manager;

create table corpus.public.tag_info
(
    name varchar,
    level int,
    primary key (name)
);

create table corpus.public.tag_relation
(
    parent varchar,
    child varchar,
    primary key (parent, child)
);

create table corpus.public.tauthor
(
    id varchar,
    name varchar,
    self varchar,
    primary key (id)
);

create table corpus.public.cauthor
(
    id varchar,
    name varchar,
    academy varchar,
    class varchar,
    primary key (id)
);

create table corpus.public.analyzed
(
    id varchar,
    char_type_count int,
    char_type_table json,
    term_type_count int,
    term_type_table json,
    body_len int,
    avg_sentence_len double precision,
    avg_paragraph_len double precision,
    primary key (id)
);

-- COMMENT ON TABLE tauthor IS 'implements author written qianziwen';
-- COMMENT ON TABLE tag_info IS 'implements tag information';
-- COMMENT ON TABLE tag_relation IS 'relation among the implements tags';
-- COMMENT ON TABLE analyzed IS 'the analyzed document data when loading into system';
