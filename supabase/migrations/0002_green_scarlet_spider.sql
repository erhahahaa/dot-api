CREATE TABLE IF NOT EXISTS "sport_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "sport_types_name_unique" UNIQUE("name")
);

ALTER TABLE "clubs" ALTER COLUMN "type" SET DATA TYPE text;