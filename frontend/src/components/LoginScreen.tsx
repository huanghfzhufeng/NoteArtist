import React, { useState } from 'react';
import { Zap, Key, UserPlus, Sparkles } from 'lucide-react';
import { User } from '../types';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';
import NeoInput from './ui/NeoInput';

interface LoginScreenProps {
  onLogin: (user: User, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || (isRegister ? '注册失败' : '登录失败'));
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Optimized Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
            backgroundSize: '32px 32px'
          }}
        />
        {/* Floating decorative elements with refined animations */}
        <div className="absolute top-[10%] left-[10%] w-40 h-40 bg-[#FFD93D] border-4 border-black rotate-12 opacity-30 animate-float" />
        <div className="absolute bottom-[10%] right-[5%] w-32 h-32 bg-[#FF6B6B] border-4 border-black -rotate-12 opacity-30 animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[40%] right-[10%] w-20 h-20 bg-[#4ECDC4] border-4 border-black rotate-45 opacity-30 animate-float" style={{ animationDelay: '-4s' }} />
        <div className="absolute bottom-[20%] left-[15%] w-12 h-12 bg-[#C4B5FD] border-4 border-black -rotate-45 opacity-30 animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-spring-in">
        {/* Logo Section - Enhanced */}
        <div className="text-center mb-12">
          <div className="inline-block relative group cursor-crosshair">
            <div className="w-24 h-24 bg-[#FFD93D] border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#000] transform transition-transform group-hover:rotate-6 group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none">
              <Zap className="w-12 h-12 fill-black stroke-black" />
            </div>
            <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-[#FF6B6B] animate-pulse" />
          </div>

          <div className="mt-8 relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Note<span className="text-[#FF6B6B]">Artist</span>
            </h1>
            <div className="absolute -bottom-2 -right-4 w-full h-3 bg-[#4ECDC4] -z-10 opacity-50 skew-x-12" />
          </div>

          <div className="mt-6">
            <div className="inline-block bg-black text-white px-6 py-2.5 transform -rotate-1 shadow-[4px_4px_0px_0px_#FFD93D]">
              <p className="font-black text-xs uppercase tracking-[0.3em]">
                ✨ AI 内容创作工作室 ✨
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="transform hover:rotate-1 transition-transform duration-300">
          <NeoCard
            title={isRegister ? '🚀 开启创作之路' : '🔐 欢迎回来'}
            color="white"
            className="shadow-[12px_12px_0px_0px_#000]"
          >
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {error && (
                <div className="bg-[#FF6B6B] border-4 border-black p-4 text-white font-black text-sm shadow-[4px_4px_0px_0px_#000] animate-in slide-in-from-top-2">
                  ⚠️ {error}
                </div>
              )}

              <NeoInput
                label="创作账号"
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <NeoInput
                type="password"
                label="访问密钥"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="pt-2">
                <NeoButton
                  variant="primary"
                  className="w-full text-xl py-8"
                  type="submit"
                  disabled={loading}
                  icon={loading ? undefined : (isRegister ? UserPlus : Key)}
                >
                  {loading ? '同步中...' : (isRegister ? '立即加入' : '进入工作室')}
                </NeoButton>
              </div>

              <div className="text-center pt-4 border-t-4 border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="group relative font-black text-xs uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
                >
                  <span className="relative z-10">
                    {isRegister ? '← 已有凭证？点击验证' : '没有身份？点击注册 →'}
                  </span>
                  <div className="absolute -bottom-1 left-0 w-0 h-1 bg-[#FFD93D] group-hover:w-full transition-all duration-300" />
                </button>
              </div>
            </form>
          </NeoCard>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-2 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
            Precision crafted by NoteArtist Team
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-bold text-zinc-400">
            <span>GEMINI 2.0</span>
            <span className="w-1 h-1 bg-zinc-300 rounded-full my-auto" />
            <span>IMAGEN AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
