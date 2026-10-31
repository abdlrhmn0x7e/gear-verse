ALTER TABLE "categories" ADD COLUMN "cover_media_id" bigint;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_cover_media_id_idx" ON "categories" USING btree ("cover_media_id");