ALTER TABLE "products" ADD COLUMN "allow_backorder" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "backordered_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_backordered_quantity_range" CHECK ("order_items"."backordered_quantity" BETWEEN 0 AND "order_items"."quantity");