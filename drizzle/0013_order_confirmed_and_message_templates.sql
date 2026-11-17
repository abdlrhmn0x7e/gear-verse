ALTER TYPE "public"."order_status" ADD VALUE 'CONFIRMED' BEFORE 'SHIPPED';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "order_message_templates" jsonb;