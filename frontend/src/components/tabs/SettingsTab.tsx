import React, { useState, useEffect, useCallback } from 'react';
import { Key, Save, CheckCircle2, Shield, Sparkles, AlertCircle } from 'lucide-react';
import NeoButton from '../ui/NeoButton';

interface SettingsTabProps {
  onError: (error: string | null) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onError }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [imagenKey, setImagenKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasImagenKey, setHasImagenKey] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.geminiApiKey) {
          setGeminiKey('••••••••••••••••');
          setHasGeminiKey(true);
        }
        if (data.imagenApiKey) {
          setImagenKey('••••••••••••••••');
          setHasImagenKey(true);
        }
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

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const body: Record<string, string> = {};
      
      if (geminiKey && !geminiKey.includes('•')) {
        body.geminiApiKey = geminiKey;
      }
      if (imagenKey && !imagenKey.includes('•')) {
        body.imagenApiKey = imagenKey;
      }

      if (Object.keys(body).length === 0) {
        onError('请输入新的 API Key');
        return;
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        loadSettings();
      } else {
        const data = await response.json();
        throw new Error(data.detail || '保存失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '保存失败');
    }
  };

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
          配置 Google Gemini 和 Imagen API Key 以启用 AI 功能
        </p>
      </div>

      {/* API Keys Card */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
        <div className="space-y-6">
          {/* Gemini Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD93D]" />
                Gemini API Key
              </label>
              {hasGeminiKey && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 已配置
                </span>
              )}
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeminiKey(e.target.value)}
              onFocus={() => {
                if (geminiKey.includes('•')) setGeminiKey('');
              }}
              className="w-full h-12 border-4 border-black px-4 font-mono text-sm focus:bg-[#FFD93D]/20 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_#000]"
              placeholder="AIza..."
            />
            <p className="text-xs text-gray-500 font-medium">
              用于内容分析和文案生成
            </p>
          </div>

          {/* Imagen Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
                Imagen API Key
              </label>
              {hasImagenKey && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 已配置
                </span>
              )}
            </div>
            <input
              type="password"
              value={imagenKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImagenKey(e.target.value)}
              onFocus={() => {
                if (imagenKey.includes('•')) setImagenKey('');
              }}
              className="w-full h-12 border-4 border-black px-4 font-mono text-sm focus:bg-[#4ECDC4]/20 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_#000]"
              placeholder="AIza..."
            />
            <p className="text-xs text-gray-500 font-medium">
              用于图像生成（通常与 Gemini Key 相同）
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6 pt-6 border-t-2 border-black/10">
          <NeoButton
            onClick={handleSave}
            icon={saved ? CheckCircle2 : Save}
            variant={saved ? 'secondary' : 'black'}
          >
            {saved ? '已保存!' : '保存设置'}
          </NeoButton>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FFD93D]/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-black text-sm mb-1">安全存储</h4>
              <p className="text-xs text-gray-600 font-medium">
                您的 API Key 会加密存储在服务器数据库中，不会明文显示或泄露。
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#4ECDC4]/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-black text-sm mb-1">获取 API Key</h4>
              <p className="text-xs text-gray-600 font-medium">
                访问 Google AI Studio 获取免费的 API Key，每日有一定的免费额度。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
