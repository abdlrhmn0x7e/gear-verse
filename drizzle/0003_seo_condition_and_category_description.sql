CREATE TYPE "public"."product_condition" AS ENUM('NEW', 'USED', 'REFURBISHED');--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "condition" "product_condition" DEFAULT 'NEW' NOT NULL;