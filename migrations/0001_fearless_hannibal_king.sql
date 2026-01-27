CREATE TABLE "roadmap_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"completions" text DEFAULT '{}' NOT NULL,
	"language" text DEFAULT 'english' NOT NULL,
	"ml_topics_completed" integer DEFAULT 0 NOT NULL,
	"ml_topics_total" integer DEFAULT 20 NOT NULL,
	"dl_topics_completed" integer DEFAULT 0 NOT NULL,
	"dl_topics_total" integer DEFAULT 14 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roadmap_progress" ADD CONSTRAINT "roadmap_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "roadmap_progress_user_id_idx" ON "roadmap_progress" USING btree ("user_id");