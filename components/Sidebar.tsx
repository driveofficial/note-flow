'use client';
import { useAppContext } from './AppContext';
import { LayoutTemplate, ChevronLeft, Search, Plus, Trash2, Edit2, Table as TableIcon, Folder, GripVertical } from 'lucide-react';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Sidebar() {
  const { 
    role, tables, setTables, categories, setCategories, 
    currentTableId, setCurrentTableId, filterCategoryId, setFilterCategoryId,
    isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen,
    setCategoryModal, setConfirmModal
  } = useAppContext();

  const [search, setSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tables.findIndex(t => t.id === active.id);
      const newIndex = tables.findIndex(t => t.id === over.id);
      setTables(arrayMove(tables, oldIndex, newIndex));
    }
  };

  const currentTable = tables.find(t => t.id === currentTableId);

  const handleAddTable = useCallback(() => {
    const newId = `tbl-${Date.now()}`;
    const newTable = {
      id: newId,
      title: 'ตารางใหม่',
      icon: '📋',
      columns: [
        { id: 'col-name', name: 'ชื่อ', type: 'text' as const, icon: 'Type', fixed: true },
        { id: `col-${Date.now()}`, name: 'คอลัมน์ 1', type: 'text' as const, icon: 'Type' },
      ],
      rows: []
    };
    setTables([...tables, newTable]);
    setCurrentTableId(newId);
  }, [tables, setTables, setCurrentTableId]);

  const handleDeleteTable = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tables.length <= 1) {
      toast.error('ต้องมีอย่างน้อย 1 ตาราง');
      return;
    }
    setConfirmModal({
      isOpen: true,
      message: 'คุณต้องการลบตารางนี้ใช่หรือไม่?',
      onConfirm: () => {
        const newTables = tables.filter(t => t.id !== id);
        setTables(newTables);
        if (currentTableId === id) setCurrentTableId(newTables[0].id);
      }
    });
  }, [tables, currentTableId, setTables, setCurrentTableId, setConfirmModal]);

  const handleDeleteCategory = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      message: 'คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?',
      onConfirm: () => {
        setCategories(categories.filter(c => c.id !== id));
        setTables(tables.map(t => ({
          ...t,
          rows: t.rows.map(r => r.categoryId === id ? { ...r, categoryId: null } : r)
        })));
        if (filterCategoryId === id) setFilterCategoryId(null);
      }
    });
  }, [categories, tables, filterCategoryId, setCategories, setTables, setFilterCategoryId, setConfirmModal]);

  const filteredTables = tables.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50
        flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-0 md:w-0 overflow-hidden border-r-0'}
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <LayoutTemplate size={14} />
            </div>
            <span className="font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">NoteFlow</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 hidden md:block"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-zinc-950 transition-all">
            <Search size={14} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="ค้นหา..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tables Section */}
          <div className="py-2">
            <div className="flex items-center justify-between px-4 py-1 group">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <TableIcon size={12} /> ตารางทั้งหมด
              </div>
              {role === 'admin' && (
                <button onClick={handleAddTable} className="p-1 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded opacity-0 group-hover:opacity-100 transition-all">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="px-2 mt-1 space-y-0.5">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={filteredTables.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTables.map(t => (
                    <SortableTableItem 
                      key={t.id} 
                      t={t} 
                      currentTableId={currentTableId}
                      setCurrentTableId={setCurrentTableId}
                      setIsMobileMenuOpen={setIsMobileMenuOpen}
                      role={role}
                      handleDeleteTable={handleDeleteTable}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* Categories Section */}
          <div className="py-2 mt-2">
            <div className="flex items-center justify-between px-4 py-1 group">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <Folder size={12} /> หมวดหมู่
              </div>
              {role === 'admin' && (
                <button onClick={() => setCategoryModal({ isOpen: true, catId: null })} className="p-1 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded opacity-0 group-hover:opacity-100 transition-all">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="px-2 mt-1 space-y-0.5">
              <div 
                onClick={() => setFilterCategoryId(null)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${filterCategoryId === null ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              >
                <div className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                <span className="flex-1 truncate">ทั้งหมด</span>
                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-500">{currentTable?.rows.length || 0}</span>
              </div>
              
              {categories.map(cat => {
                const count = currentTable?.rows.filter(r => r.categoryId === cat.id).length || 0;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => setFilterCategoryId(filterCategoryId === cat.id ? null : cat.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm group transition-colors ${filterCategoryId === cat.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 truncate">{cat.name}</span>
                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-500 group-hover:hidden">{count}</span>
                    
                    {role === 'admin' && (
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCategoryModal({ isOpen: true, catId: cat.id }); }}
                          className="p-1 text-zinc-400 hover:text-indigo-500 rounded"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                          className="p-1 text-zinc-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SortableTableItem({ t, currentTableId, setCurrentTableId, setIsMobileMenuOpen, role, handleDeleteTable }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: t.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      onClick={() => { setCurrentTableId(t.id); setIsMobileMenuOpen(false); }}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm group transition-colors ${currentTableId === t.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
    >
      {role === 'admin' && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100">
          <GripVertical size={14} />
        </div>
      )}
      <span className="text-base w-5 text-center">{t.icon}</span>
      <span className="flex-1 truncate">{t.title || 'ไม่มีชื่อ'}</span>
      {role === 'admin' && (
        <button 
          onClick={(e) => handleDeleteTable(t.id, e)}
          className="p-1 text-zinc-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
