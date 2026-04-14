'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { supabase } from '@/lib/supabase';

interface MemoFormProps {
  wallId: string;
  onSuccess: () => void;
}

const colors = [
  { id: 'yellow', hex: '#fef3c7' },
  { id: 'pink', hex: '#fce7f3' },
  { id: 'mint', hex: '#ecfdf5' },
  { id: 'blue', hex: '#eff6ff' },
  { id: 'purple', hex: '#f3e8ff' },
  { id: 'orange', hex: '#fff7ed' },
];

export const MemoForm = ({ wallId, onSuccess }: MemoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    author: '',
    content: '',
    color: 'yellow',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('memos').insert([
        {
          wall_id: wallId,
          author: formData.author || '익명',
          content: formData.content,
          color: formData.color,
        },
      ]);

      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      console.error(error.message);
      alert('메모 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">작성자</label>
        <input
          type="text"
          placeholder="닉네임 (기본: 익명)"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-gray-200 outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">색상 선택</label>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFormData({ ...formData, color: c.id })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === c.id ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">내용 (최대 200자)</label>
        <textarea
          required
          maxLength={200}
          rows={4}
          placeholder="마음을 남겨주세요..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-gray-200 outline-none resize-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '남기는 중...' : '낙서하기'}
      </Button>
    </form>
  );
};
