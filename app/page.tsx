import { AppProvider } from '@/components/AppContext';
import NoteFlowApp from '@/components/NoteFlowApp';
import { Toaster } from 'react-hot-toast';

export default function Page() {
  return (
    <AppProvider>
      <NoteFlowApp />
      <Toaster position="bottom-center" toastOptions={{
        className: 'dark:bg-zinc-800 dark:text-zinc-100',
        style: {
          borderRadius: '100px',
          background: '#18181b',
          color: '#fff',
          fontSize: '14px',
          padding: '12px 24px',
        },
      }} />
    </AppProvider>
  );
}
