CREATE TABLE "category_product_positions" (
	"category_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "category_product_positions_category_id_product_id_pk" PRIMARY KEY("category_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "category_product_positions" ADD CONSTRAINT "category_product_positions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_product_positions" ADD CONSTRAINT "category_product_positions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "category_product_positions_category_id_position_idx" ON "category_product_positions" USING btree ("category_id","position");