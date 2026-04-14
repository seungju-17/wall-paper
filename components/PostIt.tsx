import React from 'react';
import { motion } from 'framer-motion';

import { Trash2 } from 'lucide-react';

interface PostItProps {
  content: string;
  author: string;
  color: string;
  createdAt: string;
  index: number;
  isAuthorized?: boolean;
  onDelete?: () => void;
}

const colorClasses: Record<string, string> = {
  yellow: 'bg-pastel-yellow',
  pink: 'bg-pastel-pink',
  mint: 'bg-pastel-mint',
  blue: 'bg-pastel-blue',
  purple: 'bg-pastel-purple',
  orange: 'bg-pastel-orange',
};

export const PostIt = ({ content, author, color, createdAt, index, isAuthorized, onDelete }: PostItProps) => {
  // 데스크탑에서 랜덤한 느낌을 주기 위해 인덱스 기반으로 수치 계산
  const rotation = (index % 3 - 1) * 2; // -2, 0, 2
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation + 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className={`post-it ${colorClasses[color] || 'bg-pastel-yellow'} rounded-md shadow-sm border-b-2 border-r-2 border-black/5 relative group`}
    >
      {/* 권한이 있을 때만 삭제 버튼 노출 */}
      {isAuthorized && onDelete && (
        <button 
          onClick={onDelete}
          className="absolute top-2 right-2 p-2 text-red-400 bg-white/50 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          title="삭제하기"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex-1 overflow-auto whitespace-pre-wrap text-gray-800 leading-relaxed font-medium text-lg pt-4">
        {content}
      </div>
      <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-end">
        <span className="font-bold text-gray-600 text-sm">from. {author}</span>
        <span className="text-gray-400 text-[10px]">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};
