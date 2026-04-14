import { supabase } from '@/lib/supabase';
import WallView from '@/components/WallView';
import { notFound } from 'next/navigation';

export const revalidate = 0; // 실시간성을 위해 항상 최신 데이터 조회

export default async function WallPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. 담벼락 정보 조회
  const { data: wall, error: wallError } = await supabase
    .from('walls')
    .select('*')
    .eq('slug', slug)
    .single();

  if (wallError || !wall) {
    notFound();
  }

  // 2. 초기 메모 목록 조회
  const { data: memos, error: memosError } = await supabase
    .from('memos')
    .select('*')
    .eq('wall_id', wall.id)
    .order('created_at', { ascending: false });

  if (memosError) {
    console.error('Error fetching memos:', memosError.message);
  }

  return (
    <WallView wall={wall} initialMemos={memos || []} />
  );
}
