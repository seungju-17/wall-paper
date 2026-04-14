import { CreateWallForm } from '@/components/CreateWallForm';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pastel-yellow/30 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pastel-pink/30 blur-[100px] rounded-full" />
      
      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        <header className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/50 border border-white shadow-sm text-sm font-medium text-gray-600 mb-4 animate-fade-in">
            <Sparkles className="w-4 h-4 text-pastel-yellow fill-pastel-yellow" />
            <span>나만의 소중한 공간을 만들어보세요</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
            우리들의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">낙서장</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            마음을 전하는 가장 따뜻한 방법. <br />
            익명으로 남기는 작은 포스트잇 하나에 진심을 담아보세요.
          </p>
        </header>

        <section className="flex justify-center">
          <CreateWallForm />
        </section>

        <footer className="pt-12 text-sm text-gray-400 font-light">
          &copy; 2024 우리들의 낙서장. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
