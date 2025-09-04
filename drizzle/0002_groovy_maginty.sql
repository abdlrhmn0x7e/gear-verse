CREATE TYPE "public"."owner_type" AS ENUM('PRODUCT', 'CATEGORY', 'BRAND', 'USER');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('PENDING', 'READY');--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "fk_categories_parent_id";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "thumbnail_media_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "status" "status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_thumbnail_media_id_media_id_fk" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_parent_id_idx" ON "categories" USING btree ("parent_id");