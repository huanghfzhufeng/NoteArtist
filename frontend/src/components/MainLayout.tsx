import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  Users,
  Settings,
  LogOut,
  User,
  AlertTriangle,
  X
} from 'lucide-react';
import { Persona } from '../types';
import StudioTab from './tabs/StudioTab';
import PromptsTab from './tabs/PromptsTab';
import GalleryTab from './tabs/GalleryTab';
import PersonasTab from './tabs/PersonasTab';
import SettingsTab from './tabs/SettingsTab';

type TabId = 'studio' | 'prompts' | 'gallery' | 'personas' | 'settings';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabId>('studio');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPersonas = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/personas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const personasList = data.personas || [];
        setPersonas(personasList);
        const active = personasList.find((p: Persona) => p.isActive);
        if (active) setActivePersonaId(active.id);
        else if (personasList.length > 0) setActivePersonaId(personasList[0].id);
      }
    } catch (err) {
      console.error('Failed to load personas:', err);
    }
  }, []);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const currentPersona = personas.find(p => p.id === activePersonaId);

  const navItems = [
    { id: 'studio' as TabId, icon: LayoutGrid, label: '创作台', emoji: '🎨' },
    { id: 'prompts' as TabId, icon: FileText, label: '提示词库', emoji: '📝' },
    { id: 'gallery' as TabId, icon: ImageIcon, label: '作品库', emoji: '🖼️' },
    { id: 'personas' as TabId, icon: Users, label: '人设管理', emoji: '👤' },
    { id: 'settings' as TabId, icon: Settings, label: '系统设置', emoji: '⚙️' },
  ];

  const tabTitles: Record<TabId, { title: string; subtitle: string }> = {
    studio: { title: '创作台', subtitle: '将干货内容转化为精美笔记' },
    prompts: { title: '提示词库', subtitle: '管理你的视觉风格模板' },
    gallery: { title: '作品库', subtitle: '浏览和管理已生成的作品' },
    personas: { title: '人设管理', subtitle: '定义你的内容创作人设' },
    settings: { title: '系统设置', subtitle: '配置 API 密钥和偏好' }
  };

  return (
    <div className="flex h-screen bg-[#FFFDF5] text-black font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-72 border-r-4 border-black bg-[#FFD93D] flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b-4 border-black bg-black">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FFD93D] border-2 border-[#FFD93D] flex items-center justify-center">
            <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-black fill-black" />
          </div>
          <span className="hidden lg:block ml-3 font-black text-[#FFD93D] text-xl uppercase tracking-tight">
            NoteArtist
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-14 flex items-center px-3 lg:px-5 gap-3 transition-all relative group ${
                  isActive
                    ? 'bg-white border-y-4 border-black -my-[2px] z-10'
                    : 'hover:bg-black/10'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF6B6B]" />
                )}
                
                <div className={`w-10 h-10 flex items-center justify-center border-2 border-black ${
                  isActive ? 'bg-[#FF6B6B] text-white' : 'bg-white group-hover:bg-[#FFD93D]'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                
                <div className="hidden lg:block text-left">
                  <span className={`font-bold text-sm ${isActive ? 'text-black' : 'text-black/70'}`}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 lg:p-4 border-t-4 border-black bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 font-bold text-sm hover:bg-[#FF6B6B] hover:text-white border-2 border-black transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:inline">退出登录</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight">
              {tabTitles[activeTab].title}
            </h1>
            <p className="text-sm font-medium text-gray-500 hidden sm:block">
              {tabTitles[activeTab].subtitle}
            </p>
          </div>
          
          {activeTab === 'studio' && currentPersona && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#FFD93D] border-3 border-black shadow-[3px_3px_0px_0px_#000]">
              <User className="w-4 h-4" />
              <span className="text-sm font-bold hidden sm:inline">当前人设：</span>
              <span className="font-black">{currentPersona.name}</span>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-[#FF6B6B] border-4 border-black p-4 flex gap-3 items-center shadow-[4px_4px_0px_0px_#000]">
              <AlertTriangle className="w-6 h-6 text-white shrink-0" />
              <p className="font-bold text-white flex-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
            {activeTab === 'studio' && (
              <StudioTab currentPersona={currentPersona} onError={setError} />
            )}
            {activeTab === 'prompts' && <PromptsTab onError={setError} />}
            {activeTab === 'gallery' && <GalleryTab onError={setError} />}
            {activeTab === 'personas' && (
              <PersonasTab
                personas={personas}
                activePersonaId={activePersonaId}
                onPersonasChange={loadPersonas}
                onActivePersonaChange={setActivePersonaId}
                onError={setError}
              />
            )}
            {activeTab === 'settings' && <SettingsTab onError={setError} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
