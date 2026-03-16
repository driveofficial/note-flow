'use client';
import { useAppContext } from './AppContext';
import { Menu, Sun, Moon, Users } from 'lucide-react';

export default function TopBar() {
  const { 
    role, setRole, theme, toggleTheme, 
    isSidebarOpen, setIsSidebarOpen, setIsMobileMenuOpen,
    tables, currentTableId, setConfirmModal
  } = useAppContext();

  const currentTable = tables.find(t => t.id === currentTableId);

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      message: 'ต้องการสลับผู้ใช้ / ออกจากระบบใช่หรือไม่?',
      onConfirm: () => {
        setRole(null);
        sessionStorage.removeItem('noteflow-role');
      }
    });
  };

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="hidden md:flex p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
          >
            <Menu size={18} />
          </button>
        )}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
        >
          <Menu size={18} />
        </button>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">NoteFlow</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[150px] sm:max-w-xs">
            {currentTable?.title || 'ตาราง'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div 
          onClick={handleLogout}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
            role === 'admin' 
              ? 'bg-indigo-50/50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20' 
              : 'bg-green-50/50 border-green-100 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-indigo-500' : 'bg-green-500'}`} />
          {role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors"
          title="สลับผู้ใช้"
        >
          <Users size={14} />
          <span className="hidden sm:inline">สลับผู้ใช้</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
