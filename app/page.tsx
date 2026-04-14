import { CreateWallForm } from '@/components/CreateWallForm';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pastel-yellow/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pastel-pink/20 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pastel-mint/20 blur-[120px] rounded-full" />
      
      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        <header className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-white/40 border border-white/60 shadow-inner text-sm font-semibold text-gray-500 mb-4 animate-fade-in backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-orange-300 fill-orange-300" />
            <span>이름만으로 시작하는 우리들의 공간</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gray-900">
            우리들의 <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-300 via-pink-400 to-purple-500">낙서장</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            복잡한 가입 없이 이름과 비밀번호면 충분합니다. <br />
            나만의 따뜻한 낙서장을 지금 바로 확인해 보세요.
          </p>
        </header>

        <section className="flex justify-center animate-slide-up">
          <CreateWallForm />
        </section>

        <footer className="pt-20 text-sm text-gray-300 font-light tracking-widest uppercase">
          &copy; 2024 Our Wall. Handcrafted with heart.
        </footer>
      </div>
    </main>
  );
}
