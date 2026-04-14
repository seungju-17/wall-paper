'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock } from 'lucide-react';

interface RecentWall {
  title: string;
  slug: string;
  timestamp: number;
}

export const CreateWallForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    password: '',
  });
  const [recentWalls, setRecentWalls] = useState<RecentWall[]>([]);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 로컬 스토리지에서 최근 방문 기록 불러오기
    try {
      const stored = localStorage.getItem('recentWalls');
      if (stored) {
        setRecentWalls(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent walls:', error);
    }
  }, []);

  const saveToRecentWalls = (title: string, slug: string) => {
    try {
      const newWall: RecentWall = { title, slug, timestamp: Date.now() };
      const updatedWalls = [
        newWall,
        ...recentWalls.filter((w) => w.slug !== slug)
      ].slice(0, 5); // 최대 5개 유지

      setRecentWalls(updatedWalls);
      localStorage.setItem('recentWalls', JSON.stringify(updatedWalls));
    } catch (error) {
      console.error('Failed to save recent wall:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\uAC00-\uD7A3\w\s-]/g, '') // 한글 및 영숫자 허용
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecentWallClick = (wall: RecentWall) => {
    setFormData((prev) => ({
      ...prev,
      title: wall.title,
    }));
    // 패스워드 입력칸으로 자동 포커스
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 유효성 검사 추가
    if (formData.title.trim().length < 2) {
      router.push(`/error?msg=${encodeURIComponent('담벼락 이름은 최소 2자 이상이어야 합니다.')}`);
      setLoading(false);
      return;
    }

    if (formData.password.length < 4) {
      router.push(`/error?msg=${encodeURIComponent('비밀번호는 최소 4자 이상으로 설정해주세요.')}`);
      setLoading(false);
      return;
    }

    const slug = generateSlug(formData.title);
    if (!slug) {
      router.push(`/error?msg=${encodeURIComponent('유효한 담벼락 이름을 입력해주세요. 특수문자는 사용할 수 없습니다.')}`);
      setLoading(false);
      return;
    }

    try {
      // 1. 기존 담벼락 존재 여부 확인 (Login 역할)
      const { data: existingWall } = await supabase
        .from('walls')
        .select('*')
        .eq('slug', slug)
        .single();

      if (existingWall) {
        // 이미 존재한다면 비밀번호 확인
        if (existingWall.password === formData.password) {
          saveToRecentWalls(existingWall.title, existingWall.slug);
          router.push(`/wall/${encodeURIComponent(slug)}`);
          return;
        } else {
          router.push(`/error?msg=${encodeURIComponent('이미 존재하는 담벼락입니다. 비밀번호가 틀렸거나 다른 이름을 사용해주세요.')}`);
          setLoading(false);
          return;
        }
      }

      // 2. 존재하지 않는다면 새로 생성 (Signup 역할)
      const { error: insertError } = await supabase.from('walls').insert([
        {
          title: formData.title,
          slug: slug,
          password: formData.password,
        },
      ]);

      if (insertError) throw insertError;

      saveToRecentWalls(formData.title, slug);
      router.push(`/wall/${encodeURIComponent(slug)}`);
    } catch (error: any) {
      console.error('Error:', error.message);
      router.push(`/error?msg=${encodeURIComponent('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/50 w-full text-left relative z-10">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-500 ml-1">담벼락 이름</label>
          <input
            required
            type="text"
            name="title"
            placeholder="가고 싶은 곳 또는 이름"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-4 focus:ring-pastel-yellow/30 transition-all outline-none text-lg"
          />
          <p className="text-xs text-gray-400 ml-1">📍 한글/영문/숫자 2자 이상</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-500 ml-1">비밀번호</label>
          <input
            ref={passwordInputRef}
            required
            type="password"
            name="password"
            placeholder="나만의 열쇠"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-4 focus:ring-pastel-yellow/30 transition-all outline-none text-lg"
          />
          <p className="text-xs text-gray-400 ml-1">🔒 4자 이상의 비밀번호 (입장 시 필요해요!)</p>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full py-5 text-xl shadow-lg shadow-black/10">
            {loading ? '확인 중...' : '시작하기'}
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed text-center">
          같은 이름과 비밀번호를 입력하면 <br />
          언제든 다시 담벼락으로 들어올 수 있어요.
        </p>
      </form>

      {/* 최근 방문/생성한 담벼락 리스트 */}
      {recentWalls.length > 0 && (
        <div className="mt-6 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-lg animate-slide-up">
          <div className="flex items-center space-x-2 mb-4 text-gray-500">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-semibold">최근 내 낙서장</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentWalls.map((wall) => (
              <button
                key={wall.slug}
                type="button"
                onClick={() => handleRecentWallClick(wall)}
                className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 font-medium hover:bg-pastel-yellow hover:text-orange-800 transition-colors border border-gray-100 shadow-sm"
              >
                {wall.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
