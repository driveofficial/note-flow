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
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

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

  // Load data from Supabase once on mount (overrides localStorage if present)
  useEffect(() => {
    if (!isMounted) return;
    let cancelled = false;

    const loadFromSupabase = async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7267/ingest/a96f543a-6f38-4522-b1d9-e498be3ccd4f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '227859',
          },
          body: JSON.stringify({
            sessionId: '227859',
            runId: 'initial-load',
            hypothesisId: 'H1',
            location: 'components/AppContext.tsx:loadFromSupabase',
            message: 'Loading data from Supabase app_data table',
            data: {},
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        const { data, error } = await supabase
          .from('app_data')
          .select('id, data')
          .eq('id', 'main')
          .maybeSingle();

        if (cancelled) return;

        // #region agent log
        fetch('http://127.0.0.1:7267/ingest/a96f543a-6f38-4522-b1d9-e498be3ccd4f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '227859',
          },
          body: JSON.stringify({
            sessionId: '227859',
            runId: 'initial-load',
            hypothesisId: 'H1',
            location: 'components/AppContext.tsx:loadFromSupabase',
            message: 'Supabase load result',
            data: {
              hasError: !!error,
              hasData: !!data,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        if (error || !data || !data.data) return;

        const payload = data.data as {
          tables?: Table[];
          categories?: Category[];
          currentTableId?: string | null;
        };

        setTables(payload.tables || DEFAULT_TABLES);
        setCategories(payload.categories || DEFAULT_CATEGORIES);
        setCurrentTableId(payload.currentTableId || DEFAULT_TABLES[0].id);
      } catch {
        // ignore Supabase errors here, fallback is localStorage/defaults
      } finally {
        setInitialLoadCompleted(true);
      }
    };

    loadFromSupabase();

    return () => {
      cancelled = true;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !initialLoadCompleted) return;
    const payload = { tables, categories, currentTableId };
    localStorage.setItem('noteflow-db-v3', JSON.stringify(payload));

    const saveToSupabase = async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7267/ingest/a96f543a-6f38-4522-b1d9-e498be3ccd4f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '227859',
          },
          body: JSON.stringify({
            sessionId: '227859',
            runId: 'save',
            hypothesisId: 'H1',
            location: 'components/AppContext.tsx:saveToSupabase',
            message: 'Saving data to Supabase app_data table',
            data: {},
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        const { error } = await supabase.from('app_data').upsert(
          {
            id: 'main',
            data: payload,
          },
          { onConflict: 'id' }
        );

        // #region agent log
        fetch('http://127.0.0.1:7267/ingest/a96f543a-6f38-4522-b1d9-e498be3ccd4f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '227859',
          },
          body: JSON.stringify({
            sessionId: '227859',
            runId: 'save',
            hypothesisId: 'H1',
            location: 'components/AppContext.tsx:saveToSupabase',
            message: 'Supabase save result',
            data: { hasError: !!error },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      } catch {
        // ignore Supabase errors for now; localStorage is still updated
      }
    };

    saveToSupabase();
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
