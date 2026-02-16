-- Create AdmissionInquiry table
CREATE TABLE IF NOT EXISTS "AdmissionInquiry" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fullName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "currentClass" TEXT NOT NULL,
    "targetClass" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "AdmissionInquiry" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Authenticated users can read inquiries" ON "AdmissionInquiry";
CREATE POLICY "Authenticated users can read inquiries" ON "AdmissionInquiry"
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert inquiries" ON "AdmissionInquiry";
CREATE POLICY "Authenticated users can insert inquiries" ON "AdmissionInquiry"
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update inquiries" ON "AdmissionInquiry";
CREATE POLICY "Admins can update inquiries" ON "AdmissionInquiry"
    FOR UPDATE TO authenticated USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
    );

-- Grant permissions to Supabase roles
GRANT ALL ON TABLE "AdmissionInquiry" TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE "AdmissionInquiry" TO authenticated;
GRANT SELECT, INSERT ON TABLE "AdmissionInquiry" TO anon;
