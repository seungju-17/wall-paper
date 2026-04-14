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
    slug: '',
    password: '',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !formData.slug ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 중복 슬러그 체크
      const { data: existingWall } = await supabase
        .from('walls')
        .select('slug')
        .eq('slug', formData.slug)
        .single();

      if (existingWall) {
        alert('이미 존재하는 담벼락 이름입니다. 다른 이름을 사용해주세요.');
        setLoading(false);
        return;
      }

      // 2. 담벼락 생성
      const { error } = await supabase.from('walls').insert([
        {
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          password: formData.password, // 실제 서비스에서는 해싱 권장
        },
      ]);

      if (error) throw error;

      router.push(`/wall/${formData.slug}`);
    } catch (error: any) {
      console.error('Error creating wall:', error.message);
      alert('담벼락 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">담벼락 이름</label>
        <input
          required
          type="text"
          name="title"
          placeholder="예: 우리들의 졸업 축하"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-gray-200 transition-all outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">주소 (Slug)</label>
        <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-3">
          <span className="text-gray-400 text-sm mr-1">/wall/</span>
          <input
            required
            type="text"
            name="slug"
            placeholder="my-wall"
            value={formData.slug}
            onChange={handleChange}
            className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">비밀번호</label>
        <input
          required
          type="password"
          name="password"
          placeholder="작성 및 관리용 비밀번호"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-gray-200 transition-all outline-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
        {loading ? '생성 중...' : '나만의 담벼락 만들기'}
      </Button>
    </form>
  );
};
