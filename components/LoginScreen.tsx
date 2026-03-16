'use client';
import { useState } from 'react';
import { useAppContext } from './AppContext';
import { Shield, User, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginScreen() {
  const { setRole } = useAppContext();
  const [mode, setMode] = useState<'select' | 'admin'>('select');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (password === 'admin1234') {
      setRole('admin');
      sessionStorage.setItem('noteflow-role', 'admin');
      toast.success('เข้าสู่ระบบเป็นผู้ดูแลระบบ ⚙️');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleUserLogin = () => {
    setRole('user');
    sessionStorage.setItem('noteflow-role', 'user');
    toast.success('เข้าสู่ระบบเป็นผู้ใช้งาน 👤');
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-[10000] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
            <LayoutTemplate size={32} />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">NoteFlow</h1>
          <p className="text-zinc-500 dark:text-zinc-400">เลือกบทบาทเพื่อเข้าสู่ระบบ</p>
        </div>

        {mode === 'select' ? (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setMode('admin')}
              className="flex items-center gap-4 p-4 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">ผู้ดูแลระบบ</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">แก้ไข เพิ่ม ลบ และจัดการข้อมูลทั้งหมด</div>
              </div>
            </button>
            <button 
              onClick={handleUserLogin}
              className="flex items-center gap-4 p-4 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shrink-0">
                <User size={24} />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">ผู้ใช้งาน</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">ดูข้อมูลและคัดลอกข้อความเท่านั้น</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">รหัสผ่านผู้ดูแลระบบ</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="กรอกรหัสผ่าน..."
                className="w-full p-3 pr-12 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                autoFocus
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => { setMode('select'); setPassword(''); setError(''); }}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                กลับ
              </button>
              <button 
                onClick={handleAdminLogin}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
