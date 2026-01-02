import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Trash2, Copy, Download, Calendar, Tag, Sparkles } from 'lucide-react';
import { Work } from '../../types';

interface GalleryTabProps {
  onError: (error: string | null) => void;
}

const GalleryTab: React.FC<GalleryTabProps> = ({ onError }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadWorks = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/works', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorks(data.works || []);
      }
    } catch (err) {
      onError('加载作品失败');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这个作品吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadWorks();
        if (selectedWork?.id === id) setSelectedWork(null);
      } else {
        const data = await response.json();
        throw new Error(data.detail || '删除失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleCopyText = (work: Work, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${work.title}\n\n${work.content}\n\n${work.tags.map((t: string) => t.startsWith('#') ? t : `#${t}`).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(work.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadImage = (work: Work, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = work.imageUrl;
    link.download = `${work.title}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-black bg-[#FFD93D] animate-spin shadow-[4px_4px_0px_0px_#000]" 
               style={{ animationDuration: '1s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <p className="font-black mt-4 text-lg">加载作品中...</p>
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block p-8 bg-gray-100 border-4 border-dashed border-gray-300 mb-6">
          <ImageIcon className="w-20 h-20 mx-auto text-gray-300" />
        </div>
        <h2 className="text-2xl font-black mb-2">作品库空空如也</h2>
        <p className="text-gray-500 font-medium">快去创作台生成你的第一个爆款笔记吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">我的作品库</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            共 {works.length} 个作品，点击查看详情
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[#FFD93D] border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_#000]">
            📸 {works.length} 作品
          </span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {works.map((work) => (
          <div 
            key={work.id}
            onClick={() => setSelectedWork(work)}
            className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer group"
          >
            {/* Image */}
            <div className="aspect-[3/4] bg-gray-100 border-b-4 border-black overflow-hidden relative">
              <img
                src={work.imageUrl}
                alt={work.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  className="w-10 h-10 bg-[#FFD93D] border-2 border-black flex items-center justify-center hover:bg-[#ffd000] transition-colors shadow-[2px_2px_0px_0px_#000]"
                  onClick={(e) => handleCopyText(work, e)}
                  title="复制文案"
                >
                  {copiedId === work.id ? (
                    <span className="text-xs font-bold">✓</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  className="w-10 h-10 bg-[#4ECDC4] border-2 border-black flex items-center justify-center hover:bg-[#3dbdb5] transition-colors shadow-[2px_2px_0px_0px_#000]"
                  onClick={(e) => handleDownloadImage(work, e)}
                  title="下载图片"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="w-10 h-10 bg-[#FF6B6B] text-white border-2 border-black flex items-center justify-center hover:bg-[#ff5252] transition-colors shadow-[2px_2px_0px_0px_#000]"
                  onClick={(e) => handleDelete(work.id, e)}
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Info */}
            <div className="p-3">
              <h3 className="font-black text-sm leading-tight line-clamp-2 mb-2">{work.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-2">
                <Calendar className="w-3 h-3" />
                {new Date(work.createdAt).toLocaleDateString('zh-CN')}
              </div>
              <div className="flex flex-wrap gap-1">
                {work.tags.slice(0, 3).map((t: string, i: number) => (
                  <span 
                    key={i} 
                    className="text-xs bg-gray-100 px-1.5 py-0.5 border border-black font-medium"
                  >
                    {t.startsWith('#') ? t : `#${t}`}
                  </span>
                ))}
                {work.tags.length > 3 && (
                  <span className="text-xs text-gray-400 font-medium">+{work.tags.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedWork && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWork(null)}
        >
          <div 
            className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Side */}
            <div className="md:w-1/2 bg-gray-100 border-b-4 md:border-b-0 md:border-r-4 border-black">
              <img
                src={selectedWork.imageUrl}
                alt={selectedWork.title}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Content Side */}
            <div className="md:w-1/2 p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-black leading-tight pr-4">{selectedWork.title}</h2>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
                <Calendar className="w-4 h-4" />
                {new Date(selectedWork.createdAt).toLocaleString('zh-CN')}
              </div>

              <div className="bg-gray-50 border-2 border-black p-4 mb-4">
                <p className="text-sm whitespace-pre-wrap font-medium leading-relaxed">
                  {selectedWork.content}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-1 text-sm font-bold mb-2">
                  <Tag className="w-4 h-4" />
                  标签
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedWork.tags.map((t: string, i: number) => (
                    <span 
                      key={i} 
                      className="text-sm bg-[#FFD93D] px-2 py-0.5 border-2 border-black font-bold"
                    >
                      {t.startsWith('#') ? t : `#${t}`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => handleCopyText(selectedWork, e)}
                  className="flex-1 h-12 bg-[#FFD93D] border-4 border-black font-bold flex items-center justify-center gap-2 hover:bg-[#ffd000] transition-colors shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000]"
                >
                  <Copy className="w-4 h-4" />
                  {copiedId === selectedWork.id ? '已复制!' : '复制文案'}
                </button>
                <button
                  onClick={(e) => handleDownloadImage(selectedWork, e)}
                  className="flex-1 h-12 bg-[#4ECDC4] border-4 border-black font-bold flex items-center justify-center gap-2 hover:bg-[#3dbdb5] transition-colors shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000]"
                >
                  <Download className="w-4 h-4" />
                  下载图片
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryTab;
