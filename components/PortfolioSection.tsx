'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/autoplay';
import { usePortfolio, PortfolioItem, CategoryType } from './PortfolioContext';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Play, Plus, Trash2, Edit2, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getYouTubeId } from '@/lib/youtube';
import { useSettings } from './SettingsProvider';
import { validateMediaUrl, getThumbnail as getMediaThumbnail } from '@/utils/media';
import { VideoModal } from './VideoModal';
import { FilterTabs, FilterCategory } from './FilterTabs';

/**
 * Renders the primary portfolio gallery, integrating filtering mechanisms, 
 * administrative editing overlays, and detailed modal presentations.
 */
export function PortfolioSection() {
  const { items, isEditMode, deleteItem, addItem, updateItem } = usePortfolio();
  const [projects, setProjects] = useState<PortfolioItem[]>(items);

  useEffect(() => {
    // Enforce localized state synchronization following asynchronous item mutations
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProjects(items);
  }, [items]);

  const { t, lang } = useSettings();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>('all');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<'image'|'youtube'|'video'|'workshop'>('image');
  const [newCategory, setNewCategory] = useState<CategoryType>('photo');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [editType, setEditType] = useState<'image'|'youtube'|'video'|'workshop'>('image');
  const [editCategory, setEditCategory] = useState<CategoryType>('photo');
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editUrl || !editTitle) return;
    setErrorStatus(null);
    try {
      updateItem(editingItem.id, {
        type: editType,
        category: editCategory,
        url: editUrl,
        title: editTitle,
        description: editDesc,
      });
      setEditingItem(null);
    } catch (err: any) {
      setErrorStatus(err.message);
    }
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditType(item.type);
    setEditCategory(item.category || (item.type === 'youtube' || item.type === 'video' ? 'video' : item.type === 'workshop' ? 'workshop' : 'photo'));
    setEditUrl(item.url);
    setEditTitle(item.title);
    setEditDesc(item.description || '');
  };

  const [displayCount, setDisplayCount] = useState<number>(0);
  const [isMobileGrid, setIsMobileGrid] = useState<boolean>(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileGrid(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (displayCount === 0) {
      const timeoutId = setTimeout(() => {
        setDisplayCount(window.innerWidth < 1024 ? 6 : 16);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [displayCount]);

  React.useEffect(() => {
    // Invalidate pagination cursors on view mode filters
    const timeoutId = setTimeout(() => {
      setDisplayCount(window.innerWidth < 1024 ? 6 : 16);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [filter]);

  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    if (!newUrl || !newTitle) return;
    
    try {
      addItem({ type: newType, category: newCategory, url: newUrl, title: newTitle, description: newDesc });
      setNewType('image');
      setNewCategory('photo');
      setNewUrl('');
      setNewTitle('');
      setNewDesc('');
      setIsAdding(false);
    } catch (err: any) {
      setErrorStatus(err.message);
    }
  };

  const getThumbnail = (item: PortfolioItem) => {
    if (item.type === 'youtube') {
      const id = getYouTubeId(item.url);
      return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : 'https://picsum.photos/800/600';
    }
    return getMediaThumbnail(item.url);
  };

  const filteredItems = projects.filter(item => {
    if (!item) return false;
    if (filter === 'all') return true;
    
    // Establish category fallbacks to support legacy payload schemas
    const itemCategory = item.category || (
      item.type === 'youtube' || item.type === 'video' ? 'video' : 
      item.type === 'workshop' ? 'workshop' : 'photo'
    );
    
    return itemCategory === filter;
  });
  
  const visibleItems = displayCount === 0 ? filteredItems.slice(0, 16) : filteredItems.slice(0, displayCount);

  const getCategory = (item: any) => {
    return item.category || (
      item.type === 'youtube' || item.type === 'video' ? 'video' : 
      item.type === 'workshop' ? 'workshop' : 'photo'
    );
  };

  const getCategoryName = (cat: string) => {
    switch(cat) {
      case 'video': return lang === 'ar' ? 'فيديو' : lang === 'fr' ? 'VIDÉO' : 'VIDEO';
      case 'photo': return lang === 'ar' ? 'صورة' : lang === 'fr' ? 'IMAGE' : 'PHOTO';
      case 'design': return lang === 'ar' ? 'ملصق' : lang === 'fr' ? 'AFFICHE' : 'DESIGN';
      case 'workshop': return lang === 'ar' ? 'ورشة عمل' : lang === 'fr' ? 'FORMATION' : 'WORKSHOP';
      default: return cat;
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    deleteItem(id);
  };

  return (
    <section id="gallery" className="py-24 px-6 md:px-20 min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors">
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 font-tajawal tracking-tight text-zinc-900 dark:text-zinc-50">{t('gallery')}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-6">
          {t('gallery_desc')}
        </p>
        
        {isEditMode && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-6 py-3 rounded-full font-medium transition-colors"
          >
            <Plus size={18} />
            {t('add_item')}
          </button>
        )}
      </div>

      <FilterTabs currentFilter={filter} onFilterChange={setFilter} />

      {filteredItems.length === 0 ? (
        <div className="text-center py-24 text-zinc-500 dark:text-zinc-400">
          <p>لا توجد أعمال مضافة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto px-1 sm:px-6">
          {visibleItems.map((item, i) => {
            const mediaValidation = validateMediaUrl(item.url);
            const isInvalid = item.type !== 'workshop' && mediaValidation === 'invalid';
            
            const itemCategory = getCategory(item);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="w-full flex flex-col items-center justify-start"
              >
              <div
                className="group w-full relative aspect-square overflow-hidden cursor-pointer bg-zinc-200 dark:bg-zinc-800 rounded-md"
                onClick={() => {
                  if (isEditMode || isInvalid) return;
                  const mediaValidation = validateMediaUrl(item.url);
                  if (mediaValidation === 'video' || mediaValidation === 'youtube') {
                    setActiveVideoUrl(item.url);
                  } else {
                    setSelectedItem(item);
                  }
                }}
              >
                {isInvalid ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 p-4 text-center">
                    <AlertTriangle className="mb-2 w-8 h-8" />
                    <span className="text-sm font-bold">الرابط غير مدعوم</span>
                    <span className="text-xs mt-1 break-all opacity-80">{item.url}</span>
                  </div>
                ) : (
                  <>
                    <Image
                      src={getThumbnail(item)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-8 text-center">
                    {(mediaValidation === 'video' || mediaValidation === 'youtube') && (
                      <div className="mb-4">
                        <Play className="fill-zinc-900 dark:fill-white w-8 h-8 text-zinc-900 dark:text-white" />
                      </div>
                    )}
                    {item.title && <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">{item.title}</h3>}
                    {item.description && <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3 text-sm">{item.description}</p>}
                  </div>
                  
                  <div className={`absolute bottom-3 ${lang === 'ar' ? 'right-3' : 'left-3'} bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] md:text-xs font-medium tracking-widest uppercase z-10 pointer-events-none`}>
                    {getCategoryName(itemCategory)}
                  </div>
                </>
              )}

              {isEditMode && (
                <div className="absolute top-4 right-4 flex gap-2 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setItemToDelete(item.id);
                    }}
                    className="relative z-20 w-10 h-10 bg-white hover:bg-red-50 text-red-500 shadow-lg rounded-full flex items-center justify-center transition-colors cursor-pointer pointer-events-auto"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                    className="relative z-20 w-10 h-10 bg-white hover:bg-zinc-50 text-zinc-900 shadow-lg rounded-full flex items-center justify-center transition-colors cursor-pointer pointer-events-auto"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {displayCount > 0 && displayCount < filteredItems.length && (
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => setDisplayCount(prev => prev + (isMobileGrid ? 6 : 8))}
            className="px-10 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-medium tracking-wide hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-md"
          >
            {lang === 'ar' ? 'عرض المزيد' : lang === 'fr' ? 'Voir plus' : 'Load More'}
          </button>
        </div>
      )}

      {isEditMode && (
        <button 
          onClick={() => setIsAdding(true)}
          className="md:hidden mt-8 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-medium transition-colors"
        >
          <Plus size={18} />
          <span>إضافة عمل جديد</span>
        </button>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {(isEditMode && isAdding) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">{t('add_item')}</h3>
              {errorStatus && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-4">
                  {errorStatus}
                </div>
              )}
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">Category / الفئة</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="category" value="photo" checked={newCategory === 'photo'} onChange={() => {setNewCategory('photo'); setNewType('image');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${newCategory==='photo'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      PHOTOS
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="category" value="design" checked={newCategory === 'design'} onChange={() => {setNewCategory('design'); setNewType('image');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${newCategory==='design'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      LES AFFICHES
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="category" value="video" checked={newCategory === 'video'} onChange={() => {setNewCategory('video'); setNewType('video');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${newCategory==='video'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      VIDEOS
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="category" value="workshop" checked={newCategory === 'workshop'} onChange={() => {setNewCategory('workshop'); setNewType('workshop');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${newCategory==='workshop'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      FORMATIONS
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">{t('link')}</label>
                  <input type="url" required value={newUrl} onChange={e => setNewUrl(e.target.value)} dir="ltr" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white text-left transition-colors" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">{t('title')}</label>
                  <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">{t('short_desc')}</label>
                  <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white resize-none transition-colors" placeholder=""></textarea>
                </div>
                <button type="submit" className="w-full bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3 rounded-xl mt-4 transition-colors">
                  {t('add')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {(isEditMode && editingItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center w-full mb-4">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {lang === 'fr' ? 'Modifier le projet' : lang === 'ar' ? 'تعديل العمل' : 'Edit Project'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              {errorStatus && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-4">
                  {errorStatus}
                </div>
              )}
              <form onSubmit={handleEditItem} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">Category / الفئة</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="editCategory" value="photo" checked={editCategory === 'photo'} onChange={() => {setEditCategory('photo'); setEditType('image');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${editCategory==='photo'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      PHOTOS
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="editCategory" value="design" checked={editCategory === 'design'} onChange={() => {setEditCategory('design'); setEditType('image');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${editCategory==='design'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      LES AFFICHES
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="editCategory" value="video" checked={editCategory === 'video'} onChange={() => {setEditCategory('video'); setEditType('video');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${editCategory==='video'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      VIDEOS
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors">
                      <input type="radio" name="editCategory" value="workshop" checked={editCategory === 'workshop'} onChange={() => {setEditCategory('workshop'); setEditType('workshop');}} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border ${editCategory==='workshop'?'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white':'border-zinc-300 dark:border-zinc-600'}`} />
                      FORMATIONS
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">{t('link')}</label>
                  <input type="url" required value={editUrl} onChange={e => setEditUrl(e.target.value)} dir="ltr" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white text-left transition-colors" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">{t('title')}</label>
                  <input type="text" required value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors" placeholder="" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-500 dark:text-zinc-400 block">{t('short_desc')}</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white resize-none transition-colors" placeholder=""></textarea>
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                  <span>حفظ التعديلات</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* External Video Modal */}
      {activeVideoUrl && (
        <VideoModal url={activeVideoUrl} onClose={() => setActiveVideoUrl(null)} />
      )}

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedItem && (
          <Lightbox
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            items={filteredItems.filter(item => {
              if (filter === 'all') {
                return item.type === 'image';
              } else if (filter === 'photo') {
                return true;
              } else {
                const mediaType = validateMediaUrl(item.url);
                return mediaType !== 'video' && mediaType !== 'youtube';
              }
            })}
            getCategory={getCategory}
            getCategoryName={getCategoryName}
            lang={lang}
            getThumbnail={getThumbnail}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {(isEditMode && itemToDelete) && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-sm relative shadow-2xl text-center"
            >
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">تأكيد الحذف</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">هل أنت متأكد من رغبتك في حذف هذا العمل؟ لا يمكن التراجع عن هذا الإجراء.</p>
              
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => {
                    handleDeleteProject(itemToDelete);
                    setItemToDelete(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full transition-colors"
                >
                  <span>حذف</span>
                </button>
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3 rounded-full transition-colors"
                >
                  <span>إلغاء</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}

/**
 * Implements a full-screen standalone media viewer with integrated 
 * navigational controls, Swiper-based layout logic, and responsive thumbnail tracks.
 * 
 * @param {PortfolioItem} selectedItem - The currently focused media item entity.
 * @param {Function} setSelectedItem - Setter for altering the currently active component state.
 * @param {PortfolioItem[]} items - The bounded array of viable media targets.
 * @param {Function} getCategory - Resolver function determining string categorization of an item.
 * @param {Function} getCategoryName - Localized taxonomy string translation routine.
 * @param {string} lang - Selected system vernacular parameter for UI text formatting.
 * @param {Function} getThumbnail - Derivation function to extract preview representations from underlying nodes.
 */
function Lightbox({
  selectedItem,
  setSelectedItem,
  items,
  getCategory,
  getCategoryName,
  lang,
  getThumbnail,
}: {
  selectedItem: PortfolioItem;
  setSelectedItem: (item: PortfolioItem | null) => void;
  items: PortfolioItem[];
  getCategory: (item: any) => string;
  getCategoryName: (cat: string) => string;
  lang: string;
  getThumbnail: (item: PortfolioItem) => string;
}) {
  const currentIndex = items.findIndex((i) => i.id === selectedItem?.id);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const handleNext = useCallback(() => swiperInstance?.slideNext(), [swiperInstance]);
  const handlePrev = useCallback(() => swiperInstance?.slidePrev(), [swiperInstance]);

  // Re-bind stable navigation constraints across render contexts
  const handleNextRef = useRef(handleNext);
  const handlePrevRef = useRef(handlePrev);
  useEffect(() => {
    handleNextRef.current = handleNext;
    handlePrevRef.current = handlePrev;
  }, [handleNext, handlePrev]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
         if (lang === 'ar') handlePrevRef.current(); else handleNextRef.current();
      }
      if (e.key === 'ArrowLeft') {
         if (lang === 'ar') handleNextRef.current(); else handlePrevRef.current();
      }
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedItem, lang]);

  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (swiperInstance && swiperInstance.activeIndex !== currentIndex && currentIndex !== -1) {
      swiperInstance.slideTo(currentIndex);
    }
  }, [selectedItem, swiperInstance, currentIndex]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 text-white backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
      dir="ltr"
    >
      <button
        onClick={() => setSelectedItem(null)}
        className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-[110] backdrop-blur-md"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Desktop Navigation */}
      {items.length > 1 && (
        <>
          <button
            onClick={lang === 'ar' ? handleNext : handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center transition-colors z-[110] backdrop-blur-md"
          >
            {lang === 'ar' ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
          </button>
          <button
            onClick={lang === 'ar' ? handlePrev : handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center transition-colors z-[110] backdrop-blur-md"
          >
            {lang === 'ar' ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
          </button>
        </>
      )}

      <div className="w-full max-w-7xl h-[calc(100vh-200px)] relative flex flex-col items-center justify-center outline-none">
        <Swiper
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          key={lang} 
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => {
            if (items[swiper.activeIndex]) setSelectedItem(items[swiper.activeIndex]);
          }}
          initialSlide={currentIndex !== -1 ? currentIndex : 0}
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={50}
          slidesPerView={1}
          className="w-full h-full"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="relative w-full h-full flex items-center justify-center">
              <Image
                src={item.url}
                alt={item.title}
                fill
                sizes="100vw"
                className="object-contain drop-shadow-2xl select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className={`absolute bottom-6 md:bottom-12 ${lang === 'ar' ? 'right-6 md:right-12' : 'left-6 md:left-12'} bg-black/50 backdrop-blur-md px-3 py-1.5 rounded text-white text-xs md:text-sm font-medium tracking-widest uppercase z-10 pointer-events-none`}>
                {getCategoryName(getCategory(item))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {(selectedItem?.title || selectedItem?.description) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-center max-w-lg w-[calc(100%-2rem)] md:w-auto z-10 pointer-events-none">
            {selectedItem?.title && <h3 className="text-lg font-bold text-white mb-1 truncate">{selectedItem?.title}</h3>}
            {selectedItem?.description && (
              <p className="text-zinc-300 text-sm truncate">{selectedItem?.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Mobile Navigation Buttons (next to carousel) */}
      {items.length > 1 && (
        <div className="w-full max-w-5xl h-24 mt-6 flex items-center justify-center relative">
          <button
            onClick={lang === 'ar' ? handleNext : handlePrev}
            className="absolute left-2 md:hidden w-10 h-10 bg-white/10 active:bg-white/20 opacity-40 hover:opacity-100 rounded-full flex items-center justify-center transition-all z-[110] backdrop-blur-md"
          >
            {lang === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          
          <div className="flex gap-3 overflow-x-auto h-full px-14 items-center hide-scrollbar scroll-smooth w-full" dir="ltr">
            {items.map((item) => (
              <button
                key={item.id}
                ref={item.id === selectedItem?.id ? activeThumbRef : null}
                onClick={() => {
                  setSelectedItem(item);
                  const idx = items.findIndex(i => i.id === item.id);
                  if (swiperInstance && idx !== -1) swiperInstance.slideTo(idx);
                }}
                className={`relative h-20 w-20 rounded-md overflow-hidden shrink-0 border-2 transition-all duration-300 ${item.id === selectedItem?.id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <Image
                  src={getThumbnail(item)}
                  alt={item.title}
                  fill
                  sizes="100px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-white text-[8px] font-medium tracking-widest uppercase z-10 pointer-events-none`}>
                  {getCategoryName(getCategory(item))}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={lang === 'ar' ? handlePrev : handleNext}
            className="absolute right-2 md:hidden w-10 h-10 bg-white/10 active:bg-white/20 opacity-40 hover:opacity-100 rounded-full flex items-center justify-center transition-all z-[110] backdrop-blur-md"
          >
            {lang === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
      )}
    </motion.div>
  );
}
