const fs = require('fs');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// RFC 4180 compliant CSV line parser supporting quoted fields and embedded commas
function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

// Map types and nullify empty strings for non-text columns
function sanitizeStudent(row, headers) {
  const record = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i].trim();
    let val = (row[i] !== undefined ? row[i] : '').trim();

    // Integer columns
    if (['classId', 'gradeId', 'workingDays', 'presentDays'].includes(key)) {
      record[key] = val === '' ? null : parseInt(val, 10);
    }
    // Date / timestamp columns
    else if (['birthday', 'createdAt', 'dateApplication', 'dateIssue'].includes(key)) {
      record[key] = val === '' ? null : val;
    }
    // UUID / foreign keys
    else if (['parentId'].includes(key)) {
      record[key] = val === '' ? null : val;
    }
    // Text columns
    else {
      record[key] = val === '' ? null : val;
    }
  }
  return record;
}

async function run() {
  console.log('Connecting to:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const stream = fs.createReadStream('Student_rows.csv', { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  let batch = [];
  let totalImported = 0;
  let lineCount = 0;
  let multilineBuffer = '';

  for await (const line of rl) {
    lineCount++;
    if (!headers) {
      headers = parseCSVLine(line);
      console.log('Parsed headers:', headers.length, 'columns');
      continue;
    }

    // Handle multiline quoted fields if any
    if (multilineBuffer) {
      multilineBuffer += '\n' + line;
    } else {
      multilineBuffer = line;
    }

    // Check if quotes are balanced
    const quoteMatches = multilineBuffer.match(/"/g);
    const quoteCount = quoteMatches ? quoteMatches.length : 0;
    if (quoteCount % 2 !== 0) {
      // Incomplete multiline row, wait for next line
      continue;
    }

    const row = parseCSVLine(multilineBuffer);
    multilineBuffer = '';

    const student = sanitizeStudent(row, headers);
    batch.push(student);

    if (batch.length >= 100) {
      const { error } = await supabase.from('Student').upsert(batch, { onConflict: 'id' });
      if (error) {
        console.error('Batch error at total ' + totalImported + ':', error.message);
        return;
      }
      totalImported += batch.length;
      console.log(`Imported ${totalImported} students...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    const { error } = await supabase.from('Student').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error('Final batch error:', error.message);
      return;
    }
    totalImported += batch.length;
  }

  console.log(`DONE! Successfully imported ${totalImported} students.`);
}

run().catch(console.error);
