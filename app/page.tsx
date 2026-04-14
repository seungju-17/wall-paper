import { supabase } from '@/lib/supabase';
import HomeBoard from '@/components/HomeBoard';

export const revalidate = 0; // 항상 최신 담벼락 목록 조회

export default async function Home() {
  // DB에서 만들어진 모든 담벼락 조회 (최신 생성순)
  const { data: walls, error } = await supabase
    .from('walls')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching walls:', error);
  }

  return <HomeBoard initialWalls={walls || []} />;
}
