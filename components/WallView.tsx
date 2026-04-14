'use client';

import React, { useState, useEffect } from 'react';
import { PostIt } from '@/components/PostIt';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { MemoForm } from '@/components/MemoForm';
import { supabase } from '@/lib/supabase';
import { PenTool, Lock, Share2, Home, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface WallViewProps {
  wall: any;
  initialMemos: any[];
}

export default function WallView({ wall, initialMemos }: WallViewProps) {
  const router = useRouter();
  const [memos, setMemos] = useState(initialMemos);
  
  // 모달 상태
  const [isDoodleModalOpen, setIsDoodleModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // 입력 및 권한 상태
  const [passwordInput, setPasswordInput] = useState('');
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setPasswordInput(''); // 초기화
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePasswordInput !== wall.password) {
      alert('위험: 비밀번호가 일치하지 않아 담벼락을 지울 수 없습니다.');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('walls')
        .delete()
        .eq('id', wall.id);
        
      if (error) {
        throw error;
      }
      
      alert('담벼락이 성공적으로 삭제되었습니다.');
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting wall:', error);
      alert('삭제 중 오류가 발생했습니다. (RLS 정책이 적용되지 않았을 수 있습니다. Supabase 설정을 확인하세요.)');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeletePasswordInput('');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('담벼락 주소가 복사되었습니다.');
  };

  return (
    <main className="min-h-screen bg-canvas pb-32">
      {/* GNB (Header) */}
      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-900 font-bold text-lg hover:text-pastel-pink transition-colors">
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">우리들의 담벼락</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
            {wall.title}
          </h1>
          <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
            <Button variant="outline" size="sm" onClick={handleShare} className="space-x-2 border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">공유</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsDeleteModalOpen(true)} 
              className="space-x-2 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">삭제</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Memos Canvas */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {memos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
              <PenTool className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium">아직 남겨진 낙서가 없어요. 첫 번째 메시지를 남겨보세요!</p>
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
          className="flex items-center space-x-3 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-black/20 hover:bg-gray-800 transition-all font-bold text-lg border border-gray-700"
        >
          <PenTool className="w-6 h-6" />
          <span>낙서하기</span>
        </motion.button>
      </div>

      {/* 낙서용 Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="비밀번호 확인"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <p className="text-sm text-gray-500">
            담벼락에 낙서를 남기시려면 생성 시 설정한 비밀번호를 입력해주세요.
          </p>
          <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-gray-200 focus-within:ring-2 focus-within:ring-pastel-pink/30 transition-all">
            <Lock className="w-5 h-5 text-gray-400" />
            <input
              autoFocus
              required
              type="password"
              placeholder="비밀번호 입력"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-lg"
            />
          </div>
          <Button type="submit" className="w-full py-4 text-lg bg-gray-900 hover:bg-gray-800 text-white">
            확인
          </Button>
        </form>
      </Modal>

      {/* 담벼락 삭제 Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletePasswordInput('');
        }}
        title="⚠️ 담벼락 삭제"
      >
        <form onSubmit={handleDeleteSubmit} className="space-y-6">
          <p className="text-sm text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 leading-relaxed text-center">
            이 담벼락과 안에 있는 모든 낙서가 영구적으로 삭제됩니다.<br/>
            정말 지우시려면 담벼락의 비밀번호를 입력해주세요.
          </p>
          <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-gray-200 focus-within:ring-2 focus-within:ring-red-200 transition-all">
            <Lock className="w-5 h-5 text-gray-400" />
            <input
              autoFocus
              required
              type="password"
              placeholder="삭제 전용 열쇠 입력"
              value={deletePasswordInput}
              onChange={(e) => setDeletePasswordInput(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-lg"
            />
          </div>
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)} 
              className="w-1/2 py-4 text-lg"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isDeleting} 
              className="w-1/2 py-4 text-lg bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
            >
              {isDeleting ? '지우는 중...' : '영구 삭제'}
            </Button>
          </div>
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
