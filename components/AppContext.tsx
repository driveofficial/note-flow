'use client';
import { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { Role, Table, Category } from '@/lib/types';
import { DEFAULT_TABLES, DEFAULT_CATEGORIES } from '@/lib/defaultData';

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

  useLayoutEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('noteflow-db-v3');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setTables(p.tables || DEFAULT_TABLES);
        setCategories(p.categories || DEFAULT_CATEGORIES);
        setCurrentTableId(p.currentTableId || DEFAULT_TABLES[0].id);
      } catch (e) {}
    }
    const savedRole = sessionStorage.getItem('noteflow-role') as Role;
    if (savedRole) setRole(savedRole);
    
    const savedTheme = localStorage.getItem('noteflow-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('noteflow-db-v3', JSON.stringify({ tables, categories, currentTableId }));
  }, [tables, categories, currentTableId, isMounted]);

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
