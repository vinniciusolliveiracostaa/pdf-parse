CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"primary_color" text DEFAULT '#3b82f6' NOT NULL,
	"logo_url" text,
	"system_name" text DEFAULT 'Leilão Caixa' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
