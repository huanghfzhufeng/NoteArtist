import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, User, Target, MessageSquare, Heart, Hash, Sparkles } from 'lucide-react';
import { Persona } from '../../types';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import NeoInput from '../ui/NeoInput';

interface PersonasTabProps {
  personas: Persona[];
  activePersonaId: string | null;
  onPersonasChange: () => void;
  onActivePersonaChange: (id: string) => void;
  onError: (error: string | null) => void;
}

const PersonasTab: React.FC<PersonasTabProps> = ({
  personas,
  activePersonaId,
  onPersonasChange,
  onActivePersonaChange,
  onError
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: '',
    identity: '',
    targetAudience: '',
    languageStyle: '',
    coreValues: '',
    commonTags: ''
  });

  const handleAdd = async () => {
    if (!newPersona.name) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newPersona,
          commonTags: newPersona.commonTags.split(' ').filter((t: string) => t)
        })
      });

      if (response.ok) {
        setIsEditing(false);
        setNewPersona({
          name: '',
          identity: '',
          targetAudience: '',
          languageStyle: '',
          coreValues: '',
          commonTags: ''
        });
        onPersonasChange();
      } else {
        const data = await response.json();
        throw new Error(data.detail || '创建失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这个人设吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/personas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        onPersonasChange();
      } else {
        const data = await response.json();
        throw new Error(data.detail || '删除失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/personas/${id}/activate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onActivePersonaChange(id);
      onPersonasChange();
    } catch (err) {
      console.error('Failed to set active persona:', err);
    }
  };

  const colorPalette = ['#FFD93D', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">人设管理中心</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            创建不同的账号人设，让 AI 生成更符合风格的内容
          </p>
        </div>
        <NeoButton 
          icon={Plus} 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'ghost' : 'primary'}
        >
          {isEditing ? '取消' : '新建人设'}
        </NeoButton>
      </div>

      {/* New Persona Form */}
      {isEditing && (
        <NeoCard title="✨ 创建新人设" color="yellow">
          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeoInput
                label="人设名称"
                placeholder="例：暴躁产品经理"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
              />
              <NeoInput
                label="身份定位"
                placeholder="例：资深互联网产品经理"
                value={newPersona.identity}
                onChange={(e) => setNewPersona({ ...newPersona, identity: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeoInput
                label="目标受众"
                placeholder="例：互联网从业者、产品新人"
                value={newPersona.targetAudience}
                onChange={(e) => setNewPersona({ ...newPersona, targetAudience: e.target.value })}
              />
              <NeoInput
                label="语言风格"
                placeholder="例：犀利、直接、多用反问句"
                value={newPersona.languageStyle}
                onChange={(e) => setNewPersona({ ...newPersona, languageStyle: e.target.value })}
              />
            </div>
            <NeoInput
              label="核心价值观"
              placeholder="例：用户第一、数据驱动、追求极致"
              value={newPersona.coreValues}
              onChange={(e) => setNewPersona({ ...newPersona, coreValues: e.target.value })}
            />
            <NeoInput
              label="常用标签 (空格分隔)"
              placeholder="#产品 #职场 #互联网 #成长"
              value={newPersona.commonTags}
              onChange={(e) => setNewPersona({ ...newPersona, commonTags: e.target.value })}
            />
            <div className="flex justify-end">
              <NeoButton variant="black" onClick={handleAdd} icon={Sparkles}>
                保存人设
              </NeoButton>
            </div>
          </div>
        </NeoCard>
      )}

      {/* Personas Grid */}
      {personas.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-gray-300 bg-gray-50">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-400">还没有人设</p>
          <p className="text-sm text-gray-400 mt-1">点击上方按钮创建你的第一个账号人设</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {personas.map((p, index) => {
            const isActive = activePersonaId === p.id;
            const bgColor = colorPalette[index % colorPalette.length];
            
            return (
              <div
                key={p.id}
                onClick={() => handleSetActive(p.id)}
                className={`relative bg-white border-4 border-black p-5 cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'shadow-[6px_6px_0px_0px_#000] -translate-y-1' 
                    : 'shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1'
                }`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute -right-2 -top-2 bg-black text-white p-1.5 border-2 border-white shadow-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                {/* Color Bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2 border-b-2 border-black"
                  style={{ backgroundColor: bgColor }}
                />

                {/* Header */}
                <div className="flex items-start justify-between mt-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-lg"
                      style={{ backgroundColor: bgColor }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg leading-tight">{p.name}</h3>
                      {isActive && (
                        <span className="text-xs font-bold text-green-600">当前使用中</span>
                      )}
                    </div>
                  </div>
                  {personas.length > 1 && (
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="w-8 h-8 bg-gray-100 border-2 border-black flex items-center justify-center hover:bg-[#FF6B6B] hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Identity */}
                <div className="flex items-start gap-2 mb-3">
                  <User className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-gray-600 line-clamp-2">{p.identity || '未设置身份'}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  {p.targetAudience && (
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500 line-clamp-1">{p.targetAudience}</p>
                    </div>
                  )}
                  {p.languageStyle && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500 line-clamp-1">{p.languageStyle}</p>
                    </div>
                  )}
                  {p.coreValues && (
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500 line-clamp-1">{p.coreValues}</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {p.commonTags && p.commonTags.length > 0 && (
                  <div className="flex items-start gap-2 pt-3 border-t-2 border-black/10">
                    <Hash className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {p.commonTags.slice(0, 4).map((t: string, i: number) => (
                        <span 
                          key={i} 
                          className="text-xs px-1.5 py-0.5 border border-black/20 font-medium"
                          style={{ backgroundColor: `${bgColor}30` }}
                        >
                          {t.startsWith('#') ? t : `#${t}`}
                        </span>
                      ))}
                      {p.commonTags.length > 4 && (
                        <span className="text-xs text-gray-400">+{p.commonTags.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PersonasTab;
