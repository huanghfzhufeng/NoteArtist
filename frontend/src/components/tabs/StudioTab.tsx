import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Cpu,
  RefreshCw,
  Palette,
  Loader2,
  ChevronDown,
  Copy,
  Save,
  Check,
  Sparkles
} from 'lucide-react';
import { AppStatus, GenerateResult, Persona, Prompt } from '../../types';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import NeoInput from '../ui/NeoInput';

interface StudioTabProps {
  currentPersona?: Persona;
  onError: (error: string | null) => void;
}

const StudioTab: React.FC<StudioTabProps> = ({ currentPersona, onError }) => {
  const [content, setContent] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [generatedResult, setGeneratedResult] = useState<GenerateResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadPrompts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/prompts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const allPrompts = [...(data.presets || []), ...(data.custom || [])];
        setPrompts(allPrompts);
        if (allPrompts.length > 0) {
          setSelectedStyleId(allPrompts[0].id);
          setSystemPrompt(allPrompts[0].content);
        }
      }
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedStyleId(newId);
    const style = prompts.find(s => s.id === newId);
    if (style) setSystemPrompt(style.content);
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsProcessing(true);
    onError(null);
    setStatus('analyzing');
    setGeneratedResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          systemPrompt,
          personaId: currentPersona?.id || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || '生成失败');
      }

      setStatus('rendering');
      const data = await response.json();

      setStatus('done');
      setGeneratedResult({
        image: data.imageBase64,
        copy: {
          title: data.title,
          content: data.content,
          tags: data.tags
        },
        debugPrompt: data.debugPrompt
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : '生成失败');
      setStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setGeneratedResult(null);
    setStatus('idle');
    onError(null);
  };

  const handleCopyText = () => {
    if (generatedResult) {
      const text = `${generatedResult.copy.title}\n\n${generatedResult.copy.content}\n\n${generatedResult.copy.tags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ')}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveWork = async () => {
    if (!generatedResult) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/generate/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: generatedResult.image,
          title: generatedResult.copy.title,
          content: generatedResult.copy.content,
          tags: generatedResult.copy.tags,
          originalContent: content,
          promptUsed: generatedResult.debugPrompt,
          personaId: currentPersona?.id || null
        })
      });

      if (response.ok) {
        alert('✅ 已保存到作品库！');
      } else {
        const data = await response.json();
        throw new Error(data.detail || '保存失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '保存失败');
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'analyzing': return '🔍 AI 正在分析内容...';
      case 'rendering': return '🎨 正在生成图像...';
      case 'done': return '✅ 生成完成！';
      default: return '准备就绪';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
      {/* LEFT: Input Section */}
      <div className="xl:col-span-7 space-y-6">
        {/* Style Selector */}
        <NeoCard title="🎨 视觉风格" color="yellow">
          <div className="space-y-4 mt-3">
            <div className="relative">
              <select
                value={selectedStyleId}
                onChange={handleStyleChange}
                className="w-full appearance-none h-14 px-4 pr-12 border-4 border-black bg-white font-bold text-base focus:outline-none focus:ring-4 focus:ring-[#FFD93D] transition-all cursor-pointer"
              >
                {prompts.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none" />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">
                自定义提示词（可选）
              </label>
              <NeoInput
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="在此修改或自定义视觉提示词..."
                className="text-sm font-mono"
              />
            </div>
          </div>
        </NeoCard>

        {/* Content Input */}
        <NeoCard title="📝 输入内容" color="white">
          <div className="space-y-4 mt-3">
            <NeoInput
              rows={10}
              placeholder="在此粘贴你的干货内容...&#10;&#10;例如：产品经理必备的5个思维模型..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-base"
            />

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
              <div className="text-sm font-bold text-gray-500">
                {content.length > 0 && `已输入 ${content.length} 字`}
              </div>
              <div className="flex gap-3">
                <NeoButton 
                  onClick={handleReset} 
                  variant="ghost" 
                  icon={RefreshCw}
                  disabled={isProcessing}
                >
                  重置
                </NeoButton>
                <NeoButton
                  onClick={handleGenerate}
                  disabled={!content.trim() || isProcessing}
                  icon={isProcessing ? Loader2 : Sparkles}
                  variant="primary"
                  className={isProcessing ? 'animate-pulse' : ''}
                >
                  {isProcessing ? getStatusText() : '✨ 开始生成'}
                </NeoButton>
              </div>
            </div>
          </div>
        </NeoCard>
      </div>

      {/* RIGHT: Preview Section */}
      <div className="xl:col-span-5">
        <div className="sticky top-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase">📱 预览效果</h2>
            {status !== 'idle' && (
              <div className={`px-3 py-1 border-2 border-black font-bold text-sm ${
                status === 'done' ? 'bg-[#4ECDC4] text-white' : 'bg-[#FFD93D] animate-pulse'
              }`}>
                {getStatusText()}
              </div>
            )}
          </div>

          {/* Phone Mockup */}
          <div className="mx-auto max-w-[320px]">
            <div className="bg-black p-2 rounded-[2.5rem] shadow-[8px_8px_0px_0px_#000] border-4 border-black">
              {/* Phone notch */}
              <div className="h-6 bg-black w-1/3 mx-auto rounded-b-xl relative z-10" />
              
              {/* Screen */}
              <div className="bg-white rounded-[2rem] overflow-hidden -mt-3">
                <div className="h-[520px] overflow-y-auto">
                  {/* Image Area */}
                  <div className="aspect-[4/5] bg-gradient-to-br from-[#FFFDF5] to-[#FFF5E6] flex items-center justify-center relative">
                    {generatedResult ? (
                      <img
                        src={generatedResult.image.startsWith('data:') ? generatedResult.image : `data:image/png;base64,${generatedResult.image}`}
                        className="w-full h-full object-cover"
                        alt="Generated"
                      />
                    ) : (
                      <div className="text-center p-6">
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-3 text-[#FF6B6B]" />
                            <p className="font-bold text-sm text-gray-500">{getStatusText()}</p>
                          </>
                        ) : (
                          <>
                            <Palette className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                            <p className="font-bold text-sm text-gray-400">等待生成...</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-4 space-y-3 border-t-2 border-gray-100">
                    {generatedResult ? (
                      <>
                        <h3 className="font-black text-base leading-tight">
                          {generatedResult.copy.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD93D] to-[#FF6B6B]" />
                          <span className="text-xs font-bold text-gray-500">
                            {currentPersona?.name || '默认人设'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4">
                          {generatedResult.copy.content}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {generatedResult.copy.tags.slice(0, 5).map((t, i) => (
                            <span key={i} className="text-xs font-bold text-[#1d4ed8]">
                              {t.startsWith('#') ? t : `#${t}`}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {generatedResult && (
            <div className="mt-6 flex gap-3 justify-center">
              <NeoButton 
                variant="outline" 
                size="sm" 
                icon={copied ? Check : Copy} 
                onClick={handleCopyText}
              >
                {copied ? '已复制' : '复制文案'}
              </NeoButton>
              <NeoButton 
                variant="black" 
                size="sm" 
                icon={Save} 
                onClick={handleSaveWork}
              >
                保存作品
              </NeoButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioTab;
