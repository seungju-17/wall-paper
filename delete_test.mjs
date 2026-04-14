import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAll() {
  console.log('Attempting to delete walls...');
  const { data, error } = await supabase
    .from('walls')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
    
  if (error) {
    console.error('Error deleting walls:', error.message);
  } else {
    console.log('Successfully deleted all walls. Data:', data);
  }
}

deleteAll();
