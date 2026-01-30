-- Add username column to StudentHistory to preserve library ID history
ALTER TABLE "StudentHistory" ADD COLUMN IF NOT EXISTS "username" TEXT;
