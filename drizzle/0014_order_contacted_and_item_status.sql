ALTER TYPE "public"."order_status" ADD VALUE 'CONTACTED' BEFORE 'CONFIRMED';--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "status" "order_status";