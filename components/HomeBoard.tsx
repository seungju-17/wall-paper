'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, Lock, Search } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { supabase } from '@/lib/supabase';

interface Wall {
  id: string;
  slug: string;
  title: string;
  created_at: string;
}

interface HomeBoardProps {
  initialWalls: Wall[];
}

export default function HomeBoard({ initialWalls }: HomeBoardProps) {
  const router = useRouter();
  
  // 모달 상태
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWall, setSelectedWall] = useState<Wall | null>(null);
  
  // 폼 상태
  const [password, setPassword] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // 검색 상태 및 10개 랜덤 담벼락
  const [searchTerm, setSearchTerm] = useState('');
  const [randomWalls, setRandomWalls] = useState<Wall[]>([]);

  useEffect(() => {
    // 마운트 시 최대 10개의 랜덤 담벼락을 초기화 (Hydration 에러 방지용)
    const shuffled = [...initialWalls].sort(() => 0.5 - Math.random());
    setRandomWalls(shuffled.slice(0, 10));
  }, [initialWalls]);

  // 검색어에 따른 렌더링용 배열 결정
  const displayedWalls = searchTerm.trim() 
    ? initialWalls.filter(w => w.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : randomWalls;

  // 입장 클릭
  const handleJoinClick = (wall: Wall) => {
    setSelectedWall(wall);
    setPassword('');
    setIsJoinModalOpen(true);
  };

  // 입장 처리
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWall) return;
    
    setLoading(true);
    try {
      const { data: wallData, error } = await supabase
        .from('walls')
        .select('password')
        .eq('id', selectedWall.id)
        .single();
        
      if (error) throw error;
      
      if (wallData.password === password) {
        router.push(`/wall/${encodeURIComponent(selectedWall.slug)}`);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Error joining wall:', error);
      alert('입장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\uAC00-\uD7A3\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 생성 처리
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newTitle.trim().length < 2) {
      alert('담벼락 이름은 최소 2자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      alert('비밀번호는 최소 4자 이상으로 설정해주세요.');
      setLoading(false);
      return;
    }

    const slug = generateSlug(newTitle);
    if (!slug) {
      alert('유효한 담벼락 이름을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const { data: existingWall } = await supabase
        .from('walls')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingWall) {
        alert('이미 같은 이름의 담벼락이 존재합니다. 다른 이름을 사용해주세요.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('walls').insert([
        {
          title: newTitle,
          slug: slug,
          password: password,
        },
      ]);

      if (insertError) throw insertError;

      router.push(`/wall/${encodeURIComponent(slug)}`);
    } catch (error) {
      console.error('Error creating wall:', error);
      alert('생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 relative overflow-x-hidden bg-[url('/bg-doldam.png')] bg-cover bg-center bg-fixed bg-no-repeat">
      {/* 반투명 오버레이를 통해 글씨 가독성 향상 */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      
      <div className="relative z-10 max-w-6xl w-full space-y-12 pt-12 pb-32">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-white/70 border border-white shadow-sm text-sm font-semibold text-gray-600 mb-4 animate-fade-in backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>누구나 자유롭게 남기는 익명 공간</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 drop-shadow-md">
            우리들의 <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600">담벼락</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-medium bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-2 inline-block shadow-sm">
            원하는 담벼락을 찾거나 새로운 담벼락을 만들어보세요.
          </p>
        </header>

        {/* 검색창 */}
        <div className="max-w-md mx-auto w-full px-4">
          <div className="relative flex items-center bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white p-2 animate-slide-up">
            <div className="pl-4 pr-2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="찾고 싶은 담벼락 이름을 입력하세요..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 bg-transparent border-none outline-none text-gray-700 font-medium placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* 담벼락 리스트 그리드 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up px-4">
          {/* 검색어가 없을 때만 새 담벼락 만들기 카드 노출 */}
          {!searchTerm.trim() && (
            <button
              onClick={() => {
                setNewTitle('');
                setPassword('');
                setIsCreateModalOpen(true);
              }}
              className="group flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-md rounded-[2rem] border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-white/90 transition-all duration-300 h-48 shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-pink-50 transition-all">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-pink-500" />
              </div>
              <span className="font-semibold text-gray-600 group-hover:text-gray-900">새 담벼락 만들기</span>
            </button>
          )}

          {/* 기존 담벼락 카드들 */}
          {displayedWalls.length > 0 ? (
            displayedWalls.map((wall) => (
              <button
                key={wall.id}
                onClick={() => handleJoinClick(wall)}
                className="group flex flex-col text-left p-8 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-lg hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 border border-white/50 h-48 relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-pastel-yellow/30 rounded-full blur-2xl group-hover:bg-pastel-pink/30 transition-colors" />
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate w-full relative z-10">{wall.title}</h3>
                <p className="text-sm text-gray-500 mt-auto flex items-center space-x-1 relative z-10">
                  <Lock className="w-3 h-3" />
                  <span>비밀번호 보호됨</span>
                </p>
              </button>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-600 font-medium bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50">
              일치하는 담벼락이 없습니다. 직접 만들어보는 건 어떨까요?
            </div>
          )}
        </section>
      </div>

      {/* 1. 담벼락 입장 모달 */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="✨ 담벼락 입장하기"
      >
        <form onSubmit={handleJoinSubmit} className="space-y-6">
          <div className="text-center pb-4">
            <h3 className="text-2xl font-bold text-gray-900">{selectedWall?.title}</h3>
            <p className="text-sm text-gray-500 mt-2">입장하려면 비밀번호를 입력해주세요.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 ml-1">비밀번호</label>
            <input
              autoFocus
              required
              type="password"
              placeholder="나만의 열쇠"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-pastel-yellow/30 transition-all outline-none text-lg"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
            {loading ? '확인 중...' : '들어가기'}
          </Button>
        </form>
      </Modal>

      {/* 2. 새 담벼락 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="🌟 새 담벼락 만들기"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 ml-1">새 담벼락 이름</label>
            <input
              autoFocus
              required
              type="text"
              placeholder="멋진 이름을 지어주세요"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-pastel-yellow/30 transition-all outline-none text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 ml-1">비밀번호</label>
            <input
              required
              type="password"
              placeholder="작성 및 삭제 관리를 위한 열쇠"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-pastel-yellow/30 transition-all outline-none text-lg"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
            {loading ? '생성 중...' : '만들기'}
          </Button>
        </form>
      </Modal>

    </main>
  );
}
