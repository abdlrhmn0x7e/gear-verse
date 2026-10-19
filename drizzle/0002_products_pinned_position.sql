ALTER TABLE "products" ADD COLUMN "pinned_position" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "products_pinned_position_idx" ON "products" USING btree ("pinned_position");