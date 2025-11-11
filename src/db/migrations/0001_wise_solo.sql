CREATE TABLE "catalogo" (
	"id" text PRIMARY KEY NOT NULL,
	"leilao_id" text NOT NULL,
	"lote" text NOT NULL,
	"contrato" text NOT NULL,
	"descricao" text NOT NULL,
	"valor" text NOT NULL,
	"anotacoes" text,
	"peso" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leilao" (
	"id" text PRIMARY KEY NOT NULL,
	"data_licitacao" date NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relatorio" (
	"id" text PRIMARY KEY NOT NULL,
	"leilao_id" text NOT NULL,
	"cpf_cnpj" text,
	"numero_lote" text NOT NULL,
	"valor_lance" text NOT NULL,
	"tarifa" text NOT NULL,
	"total" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "role" text DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "catalogo" ADD CONSTRAINT "catalogo_leilao_id_leilao_id_fk" FOREIGN KEY ("leilao_id") REFERENCES "public"."leilao"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_leilao_id_leilao_id_fk" FOREIGN KEY ("leilao_id") REFERENCES "public"."leilao"("id") ON DELETE cascade ON UPDATE no action;