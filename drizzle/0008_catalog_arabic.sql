ALTER TABLE "categories" ADD COLUMN "name_ar" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description_ar" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "ar_reviewed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "summary_ar" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description_ar" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ar_reviewed" boolean DEFAULT false NOT NULL;