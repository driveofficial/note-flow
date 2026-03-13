'use client';
import { useAppContext } from './AppContext';
import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Filter, ArrowUpDown, Copy, Trash2, 
  Edit2, Link as LinkIcon, Type, X, Info, User,
  ChevronDown, ChevronUp, Columns, Star, Calendar, List,
  GripVertical
} from 'lucide-react';
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

export default function DataTable() {
  const { 
    role, tables, setTables, currentTableId, categories,
    filterCategoryId, setFilterCategoryId, searchQuery, setSearchQuery,
    sortMode, setSortMode, setColumnModal, setRowCategoryModal,
    setMediaPreviewModal, setConfirmModal
  } = useAppContext();

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

  const [showSearch, setShowSearch] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [expandedMobileRows, setExpandedMobileRows] = useState<Set<string>>(new Set());
  const [hiddenMobileColumns, setHiddenMobileColumns] = useState<Set<string>>(new Set());

  const table = tables.find(t => t.id === currentTableId);

  const updateTable = useCallback((newTable: any) => {
    setTables(tables.map(t => t.id === currentTableId ? newTable : t));
  }, [tables, currentTableId, setTables]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (role !== 'admin' || !table) return;
    updateTable({ ...table, title: e.target.value });
  }, [role, table, updateTable]);

  const handleAddRow = useCallback(() => {
    if (role !== 'admin' || !table) return;
    const newRow = {
      id: `r-${Date.now()}`,
      categoryId: filterCategoryId || null,
      cells: {} as Record<string, string>
    };
    table.columns.forEach(c => newRow.cells[c.id] = '');
    updateTable({ ...table, rows: [...table.rows, newRow] });
  }, [role, table, filterCategoryId, updateTable]);

  const handleDeleteRow = useCallback((rowId: string) => {
    if (role !== 'admin' || !table) return;
    setConfirmModal({
      isOpen: true,
      message: 'คุณต้องการลบข้อมูลแถวนี้ใช่หรือไม่?',
      onConfirm: () => {
        updateTable({ ...table, rows: table.rows.filter(r => r.id !== rowId) });
      }
    });
  }, [role, table, setConfirmModal, updateTable]);

  const handleDeleteColumn = useCallback((colId: string) => {
    if (role !== 'admin' || !table) return;
    setConfirmModal({
      isOpen: true,
      message: 'คุณต้องการลบคอลัมน์นี้ใช่หรือไม่?',
      onConfirm: () => {
        const newCols = table.columns.filter(c => c.id !== colId);
        const newRows = table.rows.map(r => {
          const newCells = { ...r.cells };
          delete newCells[colId];
          return { ...r, cells: newCells };
        });
        updateTable({ ...table, columns: newCols, rows: newRows });
      }
    });
  }, [role, table, setConfirmModal, updateTable]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!table) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = table.rows.findIndex(r => r.id === active.id);
      const newIndex = table.rows.findIndex(r => r.id === over.id);
      const newRows = arrayMove(table.rows, oldIndex, newIndex);
      updateTable({ ...table, rows: newRows });
    }
  };

  if (!table) return null;

  const handleCopyAll = () => {
    if (table.rows.length === 0) {
      toast.error('ไม่มีข้อมูล');
      return;
    }
    let text = table.columns.map(c => c.name).join('\t') + '\n';
    table.rows.forEach(r => {
      text += table.columns.map(c => r.cells[c.id] || '').join('\t') + '\n';
    });
    navigator.clipboard.writeText(text).then(() => toast.success('คัดลอกทั้งตารางแล้ว! ✅'));
  };

  // Filtering & Sorting
  let displayRows = [...table.rows];
  if (filterCategoryId) {
    displayRows = displayRows.filter(r => r.categoryId === filterCategoryId);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayRows = displayRows.filter(r => 
      Object.values(r.cells).some(v => (v || '').toLowerCase().includes(q))
    );
  }
  if (sortMode === 'name-asc') {
    displayRows.sort((a, b) => (a.cells['col-name'] || '').localeCompare(b.cells['col-name'] || '', 'th'));
  } else if (sortMode === 'name-desc') {
    displayRows.sort((a, b) => (b.cells['col-name'] || '').localeCompare(a.cells['col-name'] || '', 'th'));
  } else if (sortMode === 'category') {
    displayRows.sort((a, b) => {
      const ca = categories.find(c => c.id === a.categoryId)?.name || 'zzz';
      const cb = categories.find(c => c.id === b.categoryId)?.name || 'zzz';
      return ca.localeCompare(cb, 'th');
    });
  }

  const toggleRowSelection = (rowId: string) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }
    setSelectedRowIds(newSet);
  };

  const toggleAllSelection = () => {
    if (selectedRowIds.size === displayRows.length && displayRows.length > 0) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(displayRows.map(r => r.id)));
    }
  };

  const toggleMobileRow = (rowId: string) => {
    const newSet = new Set(expandedMobileRows);
    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }
    setExpandedMobileRows(newSet);
  };

  const handleDeleteSelected = () => {
    if (selectedRowIds.size === 0) return;
    setConfirmModal({
      isOpen: true,
      message: `คุณต้องการลบข้อมูลที่เลือกจำนวน ${selectedRowIds.size} แถวใช่หรือไม่?`,
      onConfirm: () => {
        const newRows = table.rows.filter(r => !selectedRowIds.has(r.id));
        updateTable({ ...table, rows: newRows });
        setSelectedRowIds(new Set());
      }
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {/* Title Area */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">{table.icon || '📋'}</span>
        <input 
          type="text"
          value={table.title}
          onChange={handleTitleChange}
          placeholder="ไม่มีชื่อ"
          readOnly={role !== 'admin'}
          className="text-3xl md:text-4xl font-bold bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 w-full"
        />
      </div>

      {role === 'user' && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-green-700 dark:text-green-400 text-sm">
          <Info size={16} />
          <span>โหมดผู้ใช้ — คุณสามารถดูข้อมูลและคัดลอกข้อความได้เท่านั้น</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
          <button className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-md shadow-sm">Table</button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => {setShowFilter(!showFilter); setShowSort(false); setShowColumnToggle(false);}} className={`p-2 rounded-lg border transition-colors ${showFilter || filterCategoryId ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
              <Filter size={16} />
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-2">
                <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase">กรองตามหมวดหมู่</div>
                <button onClick={() => {setFilterCategoryId(null); setShowFilter(false);}} className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${filterCategoryId === null ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  <div className="w-2 h-2 rounded-full bg-zinc-400" /> ทั้งหมด
                </button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => {setFilterCategoryId(c.id); setShowFilter(false);}} className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${filterCategoryId === c.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: c.color}} /> {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => {setShowSort(!showSort); setShowFilter(false); setShowColumnToggle(false);}} className={`p-2 rounded-lg border transition-colors ${sortMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
              <ArrowUpDown size={16} />
            </button>
            {showSort && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-2">
                <button onClick={() => {setSortMode('name-asc'); setShowSort(false);}} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">ชื่อ A→Z</button>
                <button onClick={() => {setSortMode('name-desc'); setShowSort(false);}} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">ชื่อ Z→A</button>
                <button onClick={() => {setSortMode('category'); setShowSort(false);}} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">ตามหมวดหมู่</button>
                {sortMode && <button onClick={() => {setSortMode(null); setShowSort(false);}} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-red-500">ล้างการจัดเรียง</button>}
              </div>
            )}
          </div>

          <div className="relative md:hidden">
            <button onClick={() => {setShowColumnToggle(!showColumnToggle); setShowFilter(false); setShowSort(false);}} className={`p-2 rounded-lg border transition-colors ${showColumnToggle || hiddenMobileColumns.size > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
              <Columns size={16} />
            </button>
            {showColumnToggle && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-2">
                <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase">แสดง/ซ่อนคอลัมน์</div>
                <div className="max-h-60 overflow-y-auto">
                  {table.columns.map((col, idx) => {
                    const isFixed = idx === 0; // First column is fixed
                    const isHidden = hiddenMobileColumns.has(col.id);
                    return (
                      <label key={col.id} className={`w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer ${isFixed ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={!isHidden}
                          disabled={isFixed}
                          onChange={() => {
                            if (isFixed) return;
                            const newSet = new Set(hiddenMobileColumns);
                            if (isHidden) newSet.delete(col.id);
                            else newSet.add(col.id);
                            setHiddenMobileColumns(newSet);
                          }}
                          className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-zinc-700 dark:text-zinc-300 truncate">{col.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowSearch(!showSearch)} className={`p-2 rounded-lg border transition-colors ${showSearch || searchQuery ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
            <Search size={16} />
          </button>
          <button onClick={handleCopyAll} className="p-2 rounded-lg border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="คัดลอกทั้งหมด">
            <Copy size={16} />
          </button>
          {role === 'admin' && (
            <button onClick={handleAddRow} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> New
            </button>
          )}
          {role === 'admin' && selectedRowIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-500/30">
              <Trash2 size={16} /> ลบที่เลือก ({selectedRowIds.size})
            </button>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2 p-2 mb-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Search size={16} className="text-zinc-400 ml-2" />
          <input 
            type="text" 
            placeholder="ค้นหาในตาราง..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-800 dark:text-zinc-200"
            autoFocus
          />
          <button onClick={() => {setSearchQuery(''); setShowSearch(false);}} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-max">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                {role === 'admin' && (
                  <th className="w-10 p-3 border-r border-zinc-200 dark:border-zinc-800 text-center">
                    <input 
                      type="checkbox" 
                      checked={displayRows.length > 0 && selectedRowIds.size === displayRows.length}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="w-10 p-3 border-r border-zinc-200 dark:border-zinc-800 text-center"></th>
                {table.columns.map(col => (
                  <th key={col.id} className={`p-3 font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 group ${col.fixed ? 'min-w-[240px]' : 'min-w-[180px]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        {col.icon === 'Type' ? <Type size={14} className="text-zinc-400 shrink-0" /> : 
                         col.icon === 'Link' ? <LinkIcon size={14} className="text-zinc-400 shrink-0" /> : 
                         col.icon === 'User' ? <User size={14} className="text-zinc-400 shrink-0" /> : 
                         <span className="text-zinc-400 text-xs">{col.icon}</span>}
                        <span className="truncate">{col.name}</span>
                      </div>
                      {role === 'admin' && !col.fixed && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setColumnModal({ isOpen: true, colId: col.id })} className="p-1 text-zinc-400 hover:text-indigo-500 rounded"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteColumn(col.id)} className="p-1 text-zinc-400 hover:text-red-500 rounded"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {role === 'admin' && (
                  <th className="w-12 p-3 text-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => setColumnModal({ isOpen: true, colId: null })}>
                    <Plus size={16} className="mx-auto text-zinc-400" />
                  </th>
                )}
                {role === 'admin' && <th className="w-12 p-3"></th>}
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={100} className="p-12 text-center text-zinc-400 dark:text-zinc-500">
                    {filterCategoryId || searchQuery ? 'ไม่พบข้อมูล' : 'ยังไม่มีข้อมูล — กด "New" เพื่อเพิ่มแถว'}
                  </td>
                </tr>
              ) : (
                displayRows.map(row => (
                  <tr key={row.id} className={`border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group/row ${selectedRowIds.has(row.id) ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}>
                    {role === 'admin' && (
                      <td className="p-3 border-r border-zinc-200 dark:border-zinc-800 text-center align-middle">
                        <input 
                          type="checkbox" 
                          checked={selectedRowIds.has(row.id)}
                          onChange={() => toggleRowSelection(row.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="p-0 border-r border-zinc-200 dark:border-zinc-800 align-top">
                      <div 
                        onClick={() => role === 'admin' && setRowCategoryModal({ isOpen: true, rowId: row.id })}
                        className={`w-full h-10 flex items-center justify-center ${role === 'admin' ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800' : ''}`}
                        title={categories.find(c => c.id === row.categoryId)?.name || 'ไม่มีหมวดหมู่'}
                      >
                        <div 
                          className="w-2.5 h-2.5 rounded-full transition-transform group-hover/row:scale-125" 
                          style={{ backgroundColor: categories.find(c => c.id === row.categoryId)?.color || '#d4d4d8' }}
                        />
                      </div>
                    </td>
                    {table.columns.map(col => (
                      <td key={col.id} className="p-0 border-r border-zinc-200 dark:border-zinc-800 align-top relative group/cell">
                        {col.type === 'link' ? (
                          <MediaCell row={row} col={col} />
                        ) : (
                          <div className="flex items-stretch min-h-[40px] relative">
                            <SmartCell row={row} col={col} />
                            <button 
                              onClick={() => {
                                const text = row.cells[col.id] || '';
                                if (!text.trim()) {
                                  toast.error('ไม่มีข้อความ'); return;
                                }
                                navigator.clipboard.writeText(text).then(() => toast.success('คัดลอกแล้ว! ✅'));
                              }}
                              className={`absolute right-1.5 top-1.5 p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm z-20 transition-all ${role === 'user' ? 'opacity-50 group-hover/cell:opacity-100' : 'opacity-0 group-hover/cell:opacity-100'}`}
                              title="คัดลอก"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    ))}
                    {role === 'admin' && <td className="p-0 border-r border-zinc-200 dark:border-zinc-800"></td>}
                    {role === 'admin' && (
                      <td className="p-0 align-top">
                        <div className="w-full h-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title="ลบแถว">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {displayRows.length > 0 && (
            <div className="p-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              {role === 'admin' ? (
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={displayRows.length > 0 && selectedRowIds.size === displayRows.length}
                    onChange={toggleAllSelection}
                    className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">เลือกทั้งหมด</span>
                </div>
              ) : <div />}
              
              {table.columns.length > 2 && (
                <button 
                  onClick={() => {
                    if (expandedMobileRows.size === displayRows.length) {
                      setExpandedMobileRows(new Set());
                    } else {
                      setExpandedMobileRows(new Set(displayRows.map(r => r.id)));
                    }
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  {expandedMobileRows.size === displayRows.length ? (
                    <><ChevronUp size={14} /> ย่อทั้งหมด</>
                  ) : (
                    <><ChevronDown size={14} /> ขยายทั้งหมด</>
                  )}
                </button>
              )}
            </div>
          )}
          {displayRows.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-500">
              {filterCategoryId || searchQuery ? 'ไม่พบข้อมูล' : 'ยังไม่มีข้อมูล — กด "New" เพื่อเพิ่มแถว'}
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={displayRows.map(r => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {displayRows.map(row => (
                  <SortableRow 
                    key={row.id} 
                    row={row} 
                    table={table}
                    categories={categories}
                    role={role}
                    selectedRowIds={selectedRowIds}
                    toggleRowSelection={toggleRowSelection}
                    setRowCategoryModal={setRowCategoryModal}
                    handleDeleteRow={handleDeleteRow}
                    hiddenMobileColumns={hiddenMobileColumns}
                    expandedMobileRows={expandedMobileRows}
                    toggleMobileRow={toggleMobileRow}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {role === 'admin' && (
          <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <button onClick={handleAddRow} className="w-full flex items-center justify-center gap-2 p-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 bg-white dark:bg-zinc-900">
              <Plus size={16} /> เพิ่มแถวใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableRow({ 
  row, table, categories, role, selectedRowIds, toggleRowSelection, 
  setRowCategoryModal, handleDeleteRow, hiddenMobileColumns, 
  expandedMobileRows, toggleMobileRow 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const visibleMobileCols = table.columns.filter((col: any, idx: number) => idx === 0 || !hiddenMobileColumns.has(col.id));

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 ${selectedRowIds.has(row.id) ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {role === 'admin' && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <GripVertical size={18} />
            </div>
          )}
          {role === 'admin' && (
            <input 
              type="checkbox" 
              checked={selectedRowIds.has(row.id)}
              onChange={() => toggleRowSelection(row.id)}
              className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}
          <div 
            onClick={() => role === 'admin' && setRowCategoryModal({ isOpen: true, rowId: row.id })}
            className={`flex items-center gap-2 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${role === 'admin' ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800' : ''}`}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: categories.find((c: any) => c.id === row.categoryId)?.color || '#d4d4d8' }}
            />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {categories.find((c: any) => c.id === row.categoryId)?.name || 'ไม่มีหมวดหมู่'}
            </span>
          </div>
        </div>
        {role === 'admin' && (
          <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {(expandedMobileRows.has(row.id) ? visibleMobileCols : visibleMobileCols.slice(0, 2)).map((col: any) => (
          <div key={col.id} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              {col.icon === 'Type' ? <Type size={12} /> : 
               col.icon === 'Link' ? <LinkIcon size={12} /> : 
               col.icon === 'User' ? <User size={12} /> : 
               col.icon === 'Calendar' ? <Calendar size={12} /> :
               col.icon === 'List' ? <List size={12} /> :
               col.icon === 'Star' ? <Star size={12} /> :
               <span>{col.icon}</span>}
              {col.name}
            </span>
            {col.type === 'link' ? (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
                <MediaCell row={row} col={col} />
              </div>
            ) : (
              <div className="flex items-stretch min-h-[44px] relative group/cell border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
                <SmartCell row={row} col={col} />
                <button 
                  onClick={() => {
                    const text = row.cells[col.id] || '';
                    if (!text.trim()) {
                      toast.error('ไม่มีข้อความ'); return;
                    }
                    navigator.clipboard.writeText(text).then(() => toast.success('คัดลอกแล้ว! ✅'));
                  }}
                  className={`absolute right-2 top-2 p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm z-20 transition-all ${role === 'user' ? 'opacity-100' : 'opacity-0 group-hover/cell:opacity-100'}`}
                  title="คัดลอก"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {visibleMobileCols.length > 2 && (
        <button 
          onClick={() => toggleMobileRow(row.id)}
          className="w-full mt-4 py-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          {expandedMobileRows.has(row.id) ? (
            <><ChevronUp size={14} /> ซ่อนรายละเอียด</>
          ) : (
            <><ChevronDown size={14} /> ดูเพิ่มเติมอีก {visibleMobileCols.length - 2} คอลัมน์</>
          )}
        </button>
      )}
    </div>
  );
}

const BADGE_COLORS = [
  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
  'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-500/30',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30',
  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 border-violet-200 dark:border-violet-500/30',
  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/30',
  'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400 border-pink-200 dark:border-pink-500/30',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
];

function SmartCell({ row, col }: { row: any, col: any }) {
  const { role, tables, setTables, currentTableId } = useAppContext();
  const value = row.cells[col.id] || '';

  const updateCell = (newValue: string) => {
    const table = tables.find(t => t.id === currentTableId);
    if (!table) return;
    const newRows = table.rows.map(r => r.id === row.id ? { ...r, cells: { ...r.cells, [col.id]: newValue } } : r);
    setTables(tables.map(t => t.id === currentTableId ? { ...t, rows: newRows } : t));
  };

  if (col.type === 'date') {
    return (
      <div className="flex-1 flex items-center p-1.5">
        <input 
          type="date"
          value={value}
          onChange={(e) => updateCell(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          disabled={role !== 'admin'}
          className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
        />
      </div>
    );
  }

  if (col.type === 'select') {
    const optionIndex = col.options?.indexOf(value) ?? -1;
    const colorClass = optionIndex >= 0 
      ? BADGE_COLORS[optionIndex % BADGE_COLORS.length] 
      : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';

    return (
      <div className="flex-1 flex items-center p-1.5">
        <div className={`relative inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${colorClass} shadow-sm transition-colors hover:opacity-80`}>
          <select
            value={value}
            onChange={(e) => updateCell(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            disabled={role !== 'admin'}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="">เลือก...</option>
            {col.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="truncate max-w-[120px]">{value || 'เลือก...'}</span>
          <ChevronDown size={12} className="ml-1.5 opacity-60 shrink-0" />
        </div>
      </div>
    );
  }

  if (col.type === 'rating') {
    const rating = parseInt(value) || 0;
    return (
      <div className="flex-1 flex items-center gap-1 p-2.5" onClick={(e) => e.stopPropagation()}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => { e.stopPropagation(); role === 'admin' && updateCell(star.toString()); }}
            className={`transition-all ${star <= rating ? 'text-yellow-400 scale-110' : 'text-zinc-300 dark:text-zinc-700'} ${role === 'admin' ? 'hover:scale-125' : 'cursor-default'}`}
          >
            <Star size={16} fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div 
      contentEditable={role === 'admin'}
      suppressContentEditableWarning
      onBlur={(e) => updateCell(e.currentTarget.textContent || '')}
      className={`flex-1 p-2.5 text-sm outline-none whitespace-pre-wrap break-words min-h-[40px] ${role === 'admin' ? 'focus:bg-indigo-50/50 dark:focus:bg-indigo-500/10 focus:ring-2 focus:ring-indigo-500/50 z-10 relative rounded-lg' : ''}`}
      data-placeholder={`${col.name}...`}
    >
      {value}
    </div>
  );
}

function MediaCell({ row, col }: { row: any, col: any }) {
  const { role, tables, setTables, currentTableId, setMediaPreviewModal, setConfirmModal } = useAppContext();
  
  let mediaList: any[] = [];
  try {
    mediaList = JSON.parse(row.cells[col.id] || '[]');
    if (!Array.isArray(mediaList)) mediaList = [];
  } catch(e) {
    if (row.cells[col.id]?.trim()) {
      mediaList = [{ type: 'link', src: row.cells[col.id], name: 'Link' }];
    }
  }

  const updateCell = (value: string) => {
    const table = tables.find(t => t.id === currentTableId);
    if (!table) return;
    const newRows = table.rows.map(r => r.id === row.id ? { ...r, cells: { ...r.cells, [col.id]: value } } : r);
    setTables(tables.map(t => t.id === currentTableId ? { ...t, rows: newRows } : t));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newMedia = [...mediaList];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newMedia.push({
          type: file.type,
          name: file.name,
          src: ev.target?.result
        });
        updateCell(JSON.stringify(newMedia));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDelete = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      message: 'ยืนยันลบไฟล์นี้ใช่หรือไม่?',
      onConfirm: () => {
        const newMedia = [...mediaList];
        newMedia.splice(idx, 1);
        updateCell(JSON.stringify(newMedia));
      }
    });
  };

  const handleCopy = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const media = mediaList[idx];
    if (!media || media.type.startsWith('video')) {
      toast.error('ไม่สามารถคัดลอกวิดีโอได้ กรุณาดาวน์โหลดแทน');
      return;
    }
    try {
      fetch(media.src)
        .then(res => res.blob())
        .then(blob => {
          if (navigator.clipboard && navigator.clipboard.write) {
            navigator.clipboard.write([
              new window.ClipboardItem({ [blob.type]: blob })
            ]).then(() => toast.success('คัดลอกรูปภาพแล้ว! 📸'))
              .catch(() => toast.error('เบราว์เซอร์ไม่รองรับ กรุณาดาวน์โหลดแทน'));
          } else {
            toast.error('เบราว์เซอร์ไม่รองรับการคัดลอกรูปภาพ');
          }
        });
    } catch(err) {
      toast.error('เกิดข้อผิดพลาดในการคัดลอก');
    }
  };

  return (
    <div className="p-2 min-h-[40px] flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {mediaList.map((m, idx) => (
          <div key={idx} onClick={() => setMediaPreviewModal({ isOpen: true, media: m })} className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-pointer group/thumb hover:border-indigo-500 hover:shadow-md transition-all shrink-0 bg-zinc-100 dark:bg-zinc-800">
            {m.type.startsWith('video') ? (
              <>
                <video src={m.src} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 rounded">▶</div>
              </>
            ) : m.type === 'link' ? (
              <div className="w-full h-full flex items-center justify-center text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10">
                <LinkIcon size={16} />
              </div>
            ) : (
              <img src={m.src} className="w-full h-full object-cover" />
            )}
            
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
              <button onClick={(e) => handleCopy(idx, e)} className="p-1 bg-white/90 hover:bg-white text-zinc-800 rounded shadow-sm transition-transform hover:scale-110" title="คัดลอกรูป">
                <Copy size={12} />
              </button>
              {role === 'admin' && (
                <button onClick={(e) => handleDelete(idx, e)} className="p-1 bg-white/90 hover:bg-red-50 text-red-600 rounded shadow-sm transition-transform hover:scale-110" title="ลบ">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
        {role === 'admin' && (
          <label className="w-12 h-12 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer transition-colors shrink-0">
            <Plus size={16} />
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} />
          </label>
        )}
      </div>
      {role === 'user' && mediaList.length === 0 && (
        <div className="text-xs text-zinc-400 py-1">ไม่มีไฟล์</div>
      )}
    </div>
  );
}
