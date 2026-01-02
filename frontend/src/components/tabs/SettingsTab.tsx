import React, { useState, useEffect, useCallback } from 'react';
import { Key, CheckCircle2, Shield, Sparkles, Lock } from 'lucide-react';

interface SettingsTabProps {
  onError: (error: string | null) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onError }) => {
  const [loading, setLoading] = useState(true);
  const [systemConfigured, setSystemConfigured] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSystemConfigured(data.systemConfigured || false);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-black bg-[#A78BFA] animate-spin shadow-[4px_4px_0px_0px_#000]"
            style={{ animationDuration: '1s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
        </div>
        <p className="font-black mt-4 text-lg">加载设置中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A78BFA] border-4 border-black shadow-[4px_4px_0px_0px_#000] mb-4">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black">API 密钥设置</h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          配置 AI 功能所需的 API 密钥
        </p>
      </div>

      {/* System Configured Card */}
      {systemConfigured ? (
        <div className="bg-green-50 border-4 border-black p-8 shadow-[6px_6px_0px_0px_#000]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-400 border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
              <Lock className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-green-700 mb-2">🔒 系统已配置 API</h3>
              <p className="text-sm text-gray-600 font-medium max-w-md">
                管理员已在服务器端配置了 AI API 密钥。您无需手动设置，可以直接使用所有 AI 功能。
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-100 border-2 border-green-300 px-4 py-2 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-700">Gemini + Imagen 已就绪</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-black text-lg mb-2">需要配置 API</h3>
              <p className="text-sm text-gray-600 font-medium">
                系统尚未配置 AI API。请联系管理员在服务器 .env 文件中配置 OPENAI_API_KEY。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FFD93D]/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-black text-sm mb-1">安全存储</h4>
              <p className="text-xs text-gray-600 font-medium">
                API 密钥安全存储在服务器环境变量中，不会暴露给客户端。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#4ECDC4]/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-black text-sm mb-1">AI 功能</h4>
              <p className="text-xs text-gray-600 font-medium">
                支持 Gemini 文本生成和 Imagen 图像生成等 AI 能力。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
