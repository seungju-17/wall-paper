import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const slug = '한글-이름';
  const { data: existingWall, error: fetchError } = await supabase
    .from('walls')
    .select('*')
    .eq('slug', slug)
    .single();

  console.log('fetchError:', fetchError);
  console.log('existingWall:', existingWall);

  const { error: insertError } = await supabase.from('walls').insert([
    {
      title: '한글 이름',
      slug: slug,
      password: 'test',
    },
  ]);

  console.log('insertError:', insertError);
}

test();
