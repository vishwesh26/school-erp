-- Migration: Add password column to Student table for initial credential storage and PDF reporting
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "password" text;

-- Notify PostgREST that schema has been updated
NOTIFY pgrst, 'reload schema';
