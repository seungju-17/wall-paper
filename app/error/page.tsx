'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get('msg') || '알 수 없는 오류가 발생했습니다.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas bg-cover bg-center relative transition-colors">
      {/* Decorative blobs */}
      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-pastel-pink/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-pastel-yellow/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">앗! 문제가 생겼어요</h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4">
          <Button 
            onClick={() => router.back()} 
            variant="outline"
            className="w-full py-4 space-x-2 border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
            <span>이전으로 돌아가기</span>
          </Button>
          
          <Button 
            onClick={() => router.push('/')} 
            className="w-full py-4 space-x-2 shadow-lg shadow-black/10"
          >
            <Home className="w-5 h-5" />
            <span>홈으로 가기</span>
          </Button>
        </div>

        <p className="text-sm text-gray-400 font-light italic">
          내용을 고쳐서 다시 시도하면 금방 해결될 거예요! ✨
        </p>
      </motion.div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <p className="text-gray-400 animate-pulse">상황을 파악 중입니다...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
