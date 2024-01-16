SELECT 'CREATE DATABASE nombre_de_la_base_de_datos'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tienda');
DROP TABLE IF EXISTS "categorias";
DROP TABLE IF EXISTS "funkos";
DROP TABLE IF EXISTS "user_roles";
DROP TABLE IF EXISTS "usuarios";

CREATE TABLE "public"."categorias" (
                                       "id" uuid NOT NULL,
                                       "categoria" character varying(255) NOT NULL,
                                       "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                       "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                       "is_deleted" boolean DEFAULT false NOT NULL,
                                       CONSTRAINT "categorias_pkey" PRIMARY KEY ("id"),
                                       CONSTRAINT "categorias_categoria_key" UNIQUE ("categoria")
);

CREATE TABLE "public"."funkos" (
                                   "id" bigint GENERATED BY DEFAULT AS IDENTITY,
                                   "nombre" character varying(255) NOT NULL,
                                   "precio" double precision DEFAULT 0.0 NOT NULL,
                                   "cantidad" integer DEFAULT 0 NOT NULL,
                                   "imagen" text DEFAULT 'https://via.placeholder.com/150' NOT NULL,
                                   "is_deleted" boolean DEFAULT false NOT NULL,
                                   "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                   "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                   "categoria_id" uuid,
                                   CONSTRAINT "funkos_pkey" PRIMARY KEY ("id"),
                                   CONSTRAINT "funkos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias" ("id") ON DELETE CASCADE
);

DROP TABLE IF EXISTS "user_roles";
DROP SEQUENCE IF EXISTS user_roles_id_seq;
CREATE SEQUENCE user_roles_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 6 CACHE 1;

CREATE TABLE "public"."user_roles" (
                                       "user_id" bigint,
                                       "role" character varying(50) DEFAULT 'USER' NOT NULL,
                                       "id" integer DEFAULT nextval('user_roles_id_seq') NOT NULL,
                                       CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
) WITH (oids = false);

DROP TABLE IF EXISTS "usuarios";
DROP SEQUENCE IF EXISTS usuarios_id_seq;
CREATE SEQUENCE usuarios_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 5 CACHE 1;

CREATE TABLE "public"."usuarios" (
                                     "is_deleted" boolean DEFAULT false NOT NULL,
                                     "created_at" timestamp DEFAULT now() NOT NULL,
                                     "id" bigint DEFAULT nextval('usuarios_id_seq') NOT NULL,
                                     "updated_at" timestamp DEFAULT now() NOT NULL,
                                     "apellidos" character varying(255) NOT NULL,
                                     "email" character varying(255) NOT NULL,
                                     "nombre" character varying(255) NOT NULL,
                                     "password" character varying(255) NOT NULL,
                                     "username" character varying(255) NOT NULL,
                                     CONSTRAINT "usuarios_email_key" UNIQUE ("email"),
                                     CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id"),
                                     CONSTRAINT "usuarios_username_key" UNIQUE ("username")
) WITH (oids = false);
ALTER TABLE ONLY "public"."user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES usuarios(id) NOT DEFERRABLE;
-- Inserción de categorías
INSERT INTO "categorias" ("id", "categoria", "created_at", "updated_at", "is_deleted")
VALUES
    ('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9', 'disney', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
    ('6dbcbf5e-8e1c-47cc-8578-7b0a33ebc154', 'marvel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
    ('9def16db-362b-44c4-9fc9-77117758b5b0', 'superheroe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
    ('8c5c06ba-49d6-46b6-85cc-8246c0f362bc', 'otros', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);

-- Inserción de Funkos en cada categoría
INSERT INTO "funkos" ("nombre", "precio", "cantidad", "categoria_id", "created_at", "updated_at", "is_deleted")
VALUES
    ('mickey mouse', 20.0, 10, 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
    ('iron man', 25.0, 8, '6dbcbf5e-8e1c-47cc-8578-7b0a33ebc154', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
    ('spider-man', 18.0, 12, '9def16db-362b-44c4-9fc9-77117758b5b0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
    ('funko genérico', 15.0, 15, '8c5c06ba-49d6-46b6-85cc-8246c0f362bc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
-- Inserción de User Roles
INSERT INTO "user_roles" ("user_id", "role", "id") VALUES
                                                       (1,	'USER',	1),
                                                       (1,	'ADMIN',	2),
                                                       (2,	'USER',	3),
                                                       (3,	'USER',	4),
                                                       (4,	'USER',	5);
--Inserción de Usuarios
INSERT INTO "usuarios" ("is_deleted", "created_at", "id", "updated_at", "apellidos", "email", "nombre", "password", "username") VALUES
                                                                                                                                    ('f',	'2023-11-02 11:43:24.724871',	1,	'2023-11-02 11:43:24.724871',	'Admin Admin',	'admin@prueba.net',	'Admin',	'$2a$10$vPaqZvZkz6jhb7U7k/V/v.5vprfNdOnh4sxi/qpPRkYTzPmFlI9p2',	'admin'),
                                                                                                                                    ('f',	'2023-11-02 11:43:24.730431',	2,	'2023-11-02 11:43:24.730431',	'User User',	'user@prueba.net',	'User',	'$2a$12$RUq2ScW1Kiizu5K4gKoK4OTz80.DWaruhdyfi2lZCB.KeuXTBh0S.',	'user'),
                                                                                                                                    ('f',	'2023-11-02 11:43:24.733552',	3,	'2023-11-02 11:43:24.733552',	'Test Test',	'test@prueba.net',	'Test',	'$2a$10$Pd1yyq2NowcsDf4Cpf/ZXObYFkcycswqHAqBndE1wWJvYwRxlb.Pu',	'test'),
                                                                                                                                    ('f',	'2023-11-02 11:43:24.736674',	4,	'2023-11-02 11:43:24.736674',	'Otro Otro',	'otro@prueba.net',	'otro',	'$2a$12$3Q4.UZbvBMBEvIwwjGEjae/zrIr6S50NusUlBcCNmBd2382eyU0bS',	'otro');