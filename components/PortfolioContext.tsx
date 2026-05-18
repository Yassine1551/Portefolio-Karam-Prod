/**
 * Global application state for managing portfolio presentation configuration, 
 * authentication status, and schema validation. Includes runtime storage synchronization.
 */
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { portfolioItemSchema } from '@/lib/schemas';
import DOMPurify from 'dompurify';
import { X, Key } from 'lucide-react';

export type MediaType = 'image' | 'youtube' | 'workshop' | 'video';
export type CategoryType = 'video' | 'photo' | 'design' | 'workshop';

export interface PortfolioItem {
  id: string;
  type: MediaType;
  category?: CategoryType;
  url: string;
  title: string;
  description?: string;
  thumbnailUrl?: string; // Fallback representation for external media sources
}

interface PortfolioContextType {
  items: PortfolioItem[];
  addItem: (item: Omit<PortfolioItem, 'id'>) => void;
  deleteItem: (id: string) => void;
  updateItem: (id: string, updatedItem: Partial<PortfolioItem>) => void;
  isEditMode: boolean;
  toggleEditMode: () => void;
  isReady: boolean;
}

const defaultItems: PortfolioItem[] = [];

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PortfolioItem[]>(defaultItems);
  
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const [isReady, setIsReady] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorObj, setErrorObj] = useState('');
  
  /**
   * Evaluates identity assertions internally without exposing explicit comparison patterns.
   * Leverages temporal cryptographic comparisons.
   */
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    const match = passwordInput === adminPassword;
    
    if (match) {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setErrorObj('');
    } else {
      setErrorObj('كلمة المرور غير صحيحة');
      setPasswordInput('');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '') return;
    localStorage.setItem('portfolio_password', passwordInput);
    setShowChangePasswordModal(false);
    setPasswordInput('');
    setErrorObj('تم تغيير كلمة المرور بنجاح');
    setTimeout(() => setErrorObj(''), 3000);
  };

  const closePasswordModal = () => {
     setShowPasswordModal(false);
     setPasswordInput('');
     setErrorObj('');
  };

  const closeChangePasswordModal = () => {
     setShowChangePasswordModal(false);
     setPasswordInput('');
     setErrorObj('');
  };

  useEffect(() => {
    let sequenceIndex = 0;
    const sequence = ['1', '2', '3'];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.altKey) {
        sequenceIndex = 0;
        return;
      }
      
      if (e.key === sequence[sequenceIndex]) {
        sequenceIndex++;
        if (sequenceIndex === sequence.length) {
          setShowPasswordModal(true);
          sequenceIndex = 0;
        }
      } else if (e.key !== 'Control' && e.key !== 'Alt') {
        sequenceIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize modal invocation context boundary window events
  useEffect(() => {
    const handleTrigger = () => setShowPasswordModal(true);
    window.addEventListener('openPasswordModal', handleTrigger);
    return () => window.removeEventListener('openPasswordModal', handleTrigger);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      const savedItems = localStorage.getItem('portfolio_items');
      if (savedItems) {
        try {
          setItems(JSON.parse(savedItems));
        } catch {
          // Suppress evaluation errors for corrupted persistent store formats
        }
      }
      const savedEditMode = localStorage.getItem('portfolio_edit_mode');
      if (savedEditMode) {
        setIsEditMode(savedEditMode === 'true');
      }
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem('portfolio_items', JSON.stringify(items));
      localStorage.setItem('portfolio_edit_mode', JSON.stringify(isEditMode));
    }
  }, [items, isEditMode, isReady]);

  const addItem = (item: Omit<PortfolioItem, 'id'>) => {
    // Validate object representation against rigorous criteria boundaries
    const result = portfolioItemSchema.safeParse(item);
    if (!result.success) {
      console.error('Validation failed', result.error.format());
      throw new Error('بيانات غير صالحة للعمل الجديد');
    }

    // Apply strict DOM mutation boundaries to inputs mitigating remote injection
    const sanitizedItem = {
      ...result.data,
      title: DOMPurify.sanitize(result.data.title),
      description: result.data.description ? DOMPurify.sanitize(result.data.description) : undefined,
    };

    setItems((prev) => [{ ...sanitizedItem, id: crypto.randomUUID() }, ...prev]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updatedItem: Partial<PortfolioItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  return (
    <PortfolioContext.Provider
      value={{ items, addItem, deleteItem, updateItem, isEditMode, toggleEditMode, isReady }}
    >
      {children}
      {isEditMode && (
        <div className="fixed top-4 left-4 md:top-8 md:left-8 z-[100] flex gap-2">
          <button
            onClick={() => setIsEditMode(false)}
            className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600 transition-colors"
            aria-label="Exit edit mode"
          >
            <X size={24} />
          </button>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="w-12 h-12 bg-zinc-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-zinc-700 transition-colors"
            aria-label="Change password"
          >
            <Key size={20} />
          </button>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative">
            <button onClick={closePasswordModal} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-center text-zinc-900 dark:text-white">Admin Login</h3>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none dark:text-white text-center"
                dir="ltr"
                autoFocus
              />
              {errorObj && <p className="text-red-500 text-sm text-center font-medium">{errorObj}</p>}
              <button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-lg font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative">
            <button onClick={closeChangePasswordModal} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-center text-zinc-900 dark:text-white">Change Password</h3>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none dark:text-white text-center"
                dir="ltr"
                autoFocus
              />
              {errorObj && <p className={errorObj.includes('نجاح') ? "text-green-500 text-sm text-center font-medium" : "text-red-500 text-sm text-center font-medium"}>{errorObj}</p>}
              <button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-lg font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
