
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedGrades() {
    const grades = Array.from({ length: 12 }, (_, i) => ({ level: i + 1 }));

    console.log('Seeding grades:', grades);

    const { data, error } = await supabase
        .from('Grade')
        .insert(grades)
        .select();

    if (error) {
        console.error('Error seeding grades:', error);
    } else {
        console.log('Successfully seeded grades:', data);
    }
}

seedGrades();
