"use server";
import { createClient } from "@/lib/supabase/server";

export const getStudentLibraryData = async (studentId: string) => {
  const supabase = createClient();

  // 1. Get Issued Books (Active)
  const { data: issuedBooks, error: issuedError } = await supabase
    .from('BookIssue')
    .select('*, book:Book(*)')
    .eq('studentId', studentId)
    .is('returnDate', null);

  if (issuedError) console.error("Error fetching issued books:", issuedError);

  // 2. Get History (Returned)
  const { data: history, error: historyError } = await supabase
    .from('BookIssue')
    .select('*, book:Book(*)')
    .eq('studentId', studentId)
    .not('returnDate', 'is', null)
    .order('returnDate', { ascending: false })
    .limit(10);

  if (historyError) console.error("Error fetching history:", historyError);

  // 3. Calculate Fines
  // Sum fineAmount for all records for this student
  const { data: fines, error: fineError } = await supabase
    .from('BookIssue')
    .select('fineAmount')
    .eq('studentId', studentId);

  let totalFine = 0;
  if (fines) {
    totalFine = fines.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
  }
  return {
    issuedBooks: issuedBooks || [],
    history: history || [],
    totalFine
  };
};
