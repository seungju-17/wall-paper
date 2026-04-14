'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const CreateWallForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    password: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug = generateSlug(formData.title);
    if (!slug) {
      alert('유효한 담벼락 이름을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 1. 기존 담벼락 존재 여부 확인 (Login 역할)
      const { data: existingWall, error: fetchError } = await supabase
        .from('walls')
        .select('*')
        .eq('slug', slug)
        .single();

      if (existingWall) {
        // 이미 존재한다면 비밀번호 확인
        if (existingWall.password === formData.password) {
          router.push(`/wall/${slug}`);
          return;
        } else {
          alert('이미 존재하는 담벼락입니다. 비밀번호가 틀렸거나 다른 이름을 사용해주세요.');
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

      router.push(`/wall/${slug}`);
    } catch (error: any) {
      console.error('Error:', error.message);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-md w-full animate-fade-in">
      <div className="space-y-2 text-left">
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
      </div>

      <div className="space-y-2 text-left">
        <label className="text-sm font-semibold text-gray-500 ml-1">비밀번호</label>
        <input
          required
          type="password"
          name="password"
          placeholder="나만의 열쇠"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-4 focus:ring-pastel-yellow/30 transition-all outline-none text-lg"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full py-5 text-xl shadow-lg shadow-black/10">
          {loading ? '확인 중...' : '시작하기'}
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        같은 이름과 비밀번호를 입력하면 <br />
        언제든 다시 담벼락으로 들어올 수 있어요.
      </p>
    </form>
  );
};
