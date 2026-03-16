'use client';
import { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { Role, Table, Category } from '@/lib/types';
import { DEFAULT_TABLES, DEFAULT_CATEGORIES } from '@/lib/defaultData';

import { supabase } from '@/lib/supabase';
interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  currentTableId: string | null;
  setCurrentTableId: (id: string | null) => void;
  filterCategoryId: string | null;
  setFilterCategoryId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortMode: string | null;
  setSortMode: (mode: string | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Modals state
  categoryModal: { isOpen: boolean; catId: string | null };
  setCategoryModal: (v: { isOpen: boolean; catId: string | null }) => void;
  columnModal: { isOpen: boolean; colId: string | null };
  setColumnModal: (v: { isOpen: boolean; colId: string | null }) => void;
  rowCategoryModal: { isOpen: boolean; rowId: string | null };
  setRowCategoryModal: (v: { isOpen: boolean; rowId: string | null }) => void;
  mediaPreviewModal: { isOpen: boolean; media: any | null };
  setMediaPreviewModal: (v: { isOpen: boolean; media: any | null }) => void;
  confirmModal: { isOpen: boolean; message: string; onConfirm: (() => void) | null };
  setConfirmModal: (v: { isOpen: boolean; message: string; onConfirm: (() => void) | null }) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [tables, setTables] = useState<Table[]>(DEFAULT_TABLES);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [currentTableId, setCurrentTableId] = useState<string | null>(DEFAULT_TABLES[0].id);
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [categoryModal, setCategoryModal] = useState({ isOpen: false, catId: null as string | null });
  const [columnModal, setColumnModal] = useState({ isOpen: false, colId: null as string | null });
  const [rowCategoryModal, setRowCategoryModal] = useState({ isOpen: false, rowId: null as string | null });
  const [mediaPreviewModal, setMediaPreviewModal] = useState({ isOpen: false, media: null as any | null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null as (() => void) | null });

  const [isMounted, setIsMounted] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Listen to Supabase data
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('id', 'main')
        .single();
      
      if (data && data.data) {
        const payload = data.data;
        setTables(prev => JSON.stringify(prev) === JSON.stringify(payload.tables) ? prev : payload.tables || DEFAULT_TABLES);
        setCategories(prev => JSON.stringify(prev) === JSON.stringify(payload.categories) ? prev : payload.categories || DEFAULT_CATEGORIES);
        setCurrentTableId(prev => payload.currentTableId || prev);
      } else {
        // Initialize the database with default data if it doesn't exist
        await supabase.from('app_data').upsert({
          id: 'main',
          data: {
            tables: DEFAULT_TABLES,
            categories: DEFAULT_CATEGORIES,
            currentTableId: DEFAULT_TABLES[0].id
          }
        });
      }
      setIsDataLoaded(true);
    };

    fetchInitialData();

    const channel = supabase
      .channel('app_data_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_data', filter: 'id=eq.main' },
        (payload: any) => {
          if (payload.new && payload.new.data) {
            const newData = payload.new.data;
            setTables(prev => JSON.stringify(prev) === JSON.stringify(newData.tables) ? prev : newData.tables || DEFAULT_TABLES);
            setCategories(prev => JSON.stringify(prev) === JSON.stringify(newData.categories) ? prev : newData.categories || DEFAULT_CATEGORIES);
            setCurrentTableId(prev => newData.currentTableId || prev);
          }
        }
      )
      .subscribe();

    const savedRole = sessionStorage.getItem('noteflow-role') as Role;
    if (savedRole) setRole(savedRole);
    
    const savedTheme = localStorage.getItem('noteflow-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save to Supabase whenever tables or categories change locally
  useEffect(() => {
    if (!isMounted || !isDataLoaded) return;
    
    // Save immediately and rely on React's state batching for debounce
    const saveState = async () => {
      const { error } = await supabase.from('app_data').upsert({
        id: 'main',
        data: { tables, categories, currentTableId }
      });
      if (error) console.error("Supabase upsert error:", error);
    };
    
    saveState();
  }, [tables, categories, currentTableId, isMounted, isDataLoaded]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('noteflow-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <AppContext.Provider value={{
      role, setRole,
      tables, setTables,
      categories, setCategories,
      currentTableId, setCurrentTableId,
      filterCategoryId, setFilterCategoryId,
      searchQuery, setSearchQuery,
      sortMode, setSortMode,
      isSidebarOpen, setIsSidebarOpen,
      isMobileMenuOpen, setIsMobileMenuOpen,
      theme, toggleTheme,
      categoryModal, setCategoryModal,
      columnModal, setColumnModal,
      rowCategoryModal, setRowCategoryModal,
      mediaPreviewModal, setMediaPreviewModal,
      confirmModal, setConfirmModal
    }}>
      {children}
    </AppContext.Provider>
  );
};
