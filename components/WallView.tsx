'use client';

import React, { useState, useEffect } from 'react';
import { PostIt } from '@/components/PostIt';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { MemoForm } from '@/components/MemoForm';
import { supabase } from '@/lib/supabase';
import { PenTool, Lock, Share2, Home } from 'lucide-react';
import Link from 'next/link';

interface WallViewProps {
  wall: any;
  initialMemos: any[];
}

export default function WallView({ wall, initialMemos }: WallViewProps) {
  const [memos, setMemos] = useState(initialMemos);
  const [isDoodleModalOpen, setIsDoodleModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 실시간 업데이트 구독
  useEffect(() => {
    const channel = supabase
      .channel(`wall-${wall.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memos',
          filter: `wall_id=eq.${wall.id}`,
        },
        (payload) => {
          setMemos((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wall.id]);

  const handleDoodleClick = () => {
    if (isAuthorized) {
      setIsDoodleModalOpen(true);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === wall.password) {
      setIsAuthorized(true);
      setIsPasswordModalOpen(false);
      setIsDoodleModalOpen(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('담벼락 주소가 복사되었습니다.');
  };

  return (
    <main className="min-h-screen bg-canvas pb-32">
      {/* GNB (Header) */}
      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-900 font-bold text-lg">
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">우리들의 낙서장</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
            {wall.title}
          </h1>
          <Button variant="outline" size="sm" onClick={handleShare} className="space-x-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">공유하기</span>
          </Button>
        </div>
      </header>

      {/* Memos Canvas */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {memos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <PenTool className="w-10 h-10" />
            </div>
            <p className="text-lg">아직 남겨진 메시지가 없어요. 첫 번째 낙서를 남겨보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {memos.map((memo, index) => (
              <PostIt
                key={memo.id}
                content={memo.content}
                author={memo.author}
                color={memo.color}
                createdAt={memo.created_at}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDoodleClick}
          className="flex items-center space-x-3 bg-foreground text-background px-6 py-4 rounded-full shadow-2xl hover:shadow-black/20 transition-all font-bold text-lg"
        >
          <PenTool className="w-6 h-6" />
          <span>낙서하기</span>
        </motion.button>
      </div>

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="비밀번호 확인"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <p className="text-sm text-gray-500">
            담벼락에 낙서를 하려면 생성 시 설정한 비밀번호를 입력해야 합니다.
          </p>
          <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-gray-200 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
            <Lock className="w-5 h-5 text-gray-400" />
            <input
              autoFocus
              required
              type="password"
              placeholder="비밀번호 입력"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-transparent border-none outline-none"
            />
          </div>
          <Button type="submit" className="w-full">
            확인
          </Button>
        </form>
      </Modal>

      {/* Doodle Modal */}
      <Modal
        isOpen={isDoodleModalOpen}
        onClose={() => setIsDoodleModalOpen(false)}
        title="새 낙서 남기기"
      >
        <MemoForm
          wallId={wall.id}
          onSuccess={() => {
            setIsDoodleModalOpen(false);
          }}
        />
      </Modal>
    </main>
  );
}
