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
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFD93D] border-4 border-black rotate-12 opacity-20 animate-pulse" />
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-[#FF6B6B] border-4 border-black -rotate-12 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#4ECDC4] border-4 border-black rotate-45 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-block relative">
            <div className="w-24 h-24 bg-[#FFD93D] border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#000] transform hover:rotate-3 transition-transform cursor-pointer">
              <Zap className="w-12 h-12 fill-black stroke-black" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#FF6B6B] animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mt-6 mb-3">
            Note<span className="text-[#FF6B6B]">Artist</span>
          </h1>
          <div className="inline-block bg-black text-white px-4 py-2 transform -rotate-1">
            <p className="font-bold text-sm uppercase tracking-widest">
              ✨ AI 内容创作工作室 ✨
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="transform hover:rotate-0 transition-transform" style={{ transform: 'rotate(1deg)' }}>
          <NeoCard 
            title={isRegister ? '🚀 创建账号' : '🔐 登录系统'} 
            color="white"
          >
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {error && (
                <div className="bg-[#FF6B6B] border-4 border-black p-3 text-white font-bold text-sm shadow-[4px_4px_0px_0px_#000]">
                  ⚠️ {error}
                </div>
              )}

              <NeoInput
                label="用户名"
                placeholder="输入你的用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <NeoInput
                type="password"
                label="密码"
                placeholder="输入你的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <NeoButton
                variant="primary"
                className="w-full text-lg h-14"
                type="submit"
                disabled={loading}
                icon={loading ? undefined : (isRegister ? UserPlus : Key)}
              >
                {loading ? '处理中...' : (isRegister ? '立即注册' : '进入工作室')}
              </NeoButton>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="font-bold text-sm underline decoration-2 underline-offset-4 hover:text-[#FF6B6B] hover:decoration-[#FF6B6B] transition-colors"
                >
                  {isRegister ? '← 已有账号？点击登录' : '没有账号？点击注册 →'}
                </button>
              </div>
            </form>
          </NeoCard>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm font-bold text-gray-400">
          Powered by Gemini & Imagen AI
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
