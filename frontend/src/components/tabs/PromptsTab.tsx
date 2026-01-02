import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Check, X, Sparkles, Palette } from 'lucide-react';
import { Prompt } from '../../types';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import NeoInput from '../ui/NeoInput';

interface PromptsTabProps {
  onError: (error: string | null) => void;
}

const PromptsTab: React.FC<PromptsTabProps> = ({ onError }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newPrompt, setNewPrompt] = useState({ name: '', content: '', category: '自定义' });

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
      }
    } catch (err) {
      onError('加载提示词失败');
    }
  }, [onError]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleAdd = async () => {
    if (!newPrompt.name || !newPrompt.content) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrompt)
      });

      if (response.ok) {
        setIsEditing(false);
        setNewPrompt({ name: '', content: '', category: '自定义' });
        loadPrompts();
      } else {
        const data = await response.json();
        throw new Error(data.detail || '创建失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleUpdate = async () => {
    if (!editingPrompt) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingPrompt.name,
          content: editingPrompt.content,
          category: editingPrompt.category
        })
      });

      if (response.ok) {
        setEditingPrompt(null);
        loadPrompts();
      } else {
        const data = await response.json();
        throw new Error(data.detail || '更新失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个提示词吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadPrompts();
      } else {
        const data = await response.json();
        throw new Error(data.detail || '删除失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const presetPrompts = prompts.filter(p => p.isPreset);
  const customPrompts = prompts.filter(p => !p.isPreset);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">提示词模板库</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            管理视觉风格提示词，让 AI 生成更精准的图像
          </p>
        </div>
        <NeoButton 
          icon={Plus} 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'ghost' : 'primary'}
        >
          {isEditing ? '取消' : '新建提示词'}
        </NeoButton>
      </div>

      {/* New Prompt Form */}
      {isEditing && (
        <NeoCard title="✨ 创建新提示词" color="yellow">
          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeoInput
                label="名称"
                placeholder="例：赛博朋克风格"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
              />
              <NeoInput
                label="分类"
                placeholder="例：视觉风格"
                value={newPrompt.category}
                onChange={(e) => setNewPrompt({ ...newPrompt, category: e.target.value })}
              />
            </div>
            <NeoInput
              label="提示词内容"
              placeholder="详细描述你想要的视觉风格..."
              rows={5}
              value={newPrompt.content}
              onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
            />
            <div className="flex justify-end">
              <NeoButton variant="black" onClick={handleAdd} icon={Sparkles}>
                保存提示词
              </NeoButton>
            </div>
          </div>
        </NeoCard>
      )}

      {/* Preset Prompts */}
      {presetPrompts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-[#FF6B6B]" />
            <h3 className="text-lg font-black uppercase text-gray-600">系统预设</h3>
            <span className="px-2 py-0.5 bg-[#FF6B6B] text-white text-xs font-bold border-2 border-black">
              {presetPrompts.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presetPrompts.map(prompt => (
              <div 
                key={prompt.id} 
                className="bg-gradient-to-br from-[#FFD93D]/20 to-[#FF6B6B]/10 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-black text-base">{prompt.name}</h4>
                  <span className="px-2 py-0.5 bg-black text-white text-xs font-bold">
                    预设
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-bold mb-2">
                  📁 {prompt.category}
                </p>
                <p className="text-sm font-mono bg-white/50 p-2 border-2 border-black/20 line-clamp-3">
                  {prompt.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Prompts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#4ECDC4]" />
          <h3 className="text-lg font-black uppercase text-gray-600">我的提示词</h3>
          <span className="px-2 py-0.5 bg-[#4ECDC4] text-white text-xs font-bold border-2 border-black">
            {customPrompts.length}
          </span>
        </div>
        
        {customPrompts.length === 0 ? (
          <div className="text-center py-16 border-4 border-dashed border-gray-300 bg-gray-50">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-400">还没有自定义提示词</p>
            <p className="text-sm text-gray-400 mt-1">点击上方按钮创建你的第一个提示词</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customPrompts.map(prompt => (
              <div 
                key={prompt.id} 
                className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all group"
              >
                {editingPrompt?.id === prompt.id ? (
                  <div className="space-y-3">
                    <NeoInput
                      value={editingPrompt.name}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                      placeholder="名称"
                    />
                    <NeoInput
                      value={editingPrompt.content}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                      rows={3}
                      placeholder="内容"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="flex-1 h-10 bg-[#4ECDC4] text-white border-2 border-black font-bold flex items-center justify-center gap-1 hover:bg-[#3dbdb5] transition-colors"
                      >
                        <Check className="w-4 h-4" /> 保存
                      </button>
                      <button
                        onClick={() => setEditingPrompt(null)}
                        className="h-10 px-4 bg-gray-200 border-2 border-black font-bold flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-black text-base">{prompt.name}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingPrompt(prompt)}
                          className="w-8 h-8 bg-[#FFD93D] border-2 border-black flex items-center justify-center hover:bg-[#ffd000] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id)}
                          className="w-8 h-8 bg-[#FF6B6B] text-white border-2 border-black flex items-center justify-center hover:bg-[#ff5252] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-bold mb-2">
                      📁 {prompt.category}
                    </p>
                    <p className="text-sm font-mono bg-gray-50 p-2 border-2 border-black/10 line-clamp-3">
                      {prompt.content}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptsTab;
