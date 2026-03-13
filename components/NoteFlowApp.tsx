'use client';
import { useAppContext } from './AppContext';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DataTable from './DataTable';
import Modals from './Modals';

export default function NoteFlowApp() {
  const { role, currentTableId } = useAppContext();

  if (!role) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar />
        <DataTable key={currentTableId} />
      </div>
      <Modals />
    </div>
  );
}
