-- Create Receptionist table
CREATE TABLE IF NOT EXISTS "Receptionist" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "img" TEXT,
    "bloodType" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "birthday" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "Receptionist" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Authenticated users can read receptionists" ON "Receptionist";
CREATE POLICY "Authenticated users can read receptionists" ON "Receptionist"
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert receptionists" ON "Receptionist";
CREATE POLICY "Admins can insert receptionists" ON "Receptionist"
    FOR INSERT TO authenticated WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Admins can update receptionists" ON "Receptionist";
CREATE POLICY "Admins can update receptionists" ON "Receptionist"
    FOR UPDATE TO authenticated USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
);

-- Grant permissions to Supabase roles
GRANT ALL ON TABLE "Receptionist" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE "Receptionist" TO authenticated;
