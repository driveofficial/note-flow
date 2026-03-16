'use client';
import { useAppContext } from './AppContext';
import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { X, Type, Link as LinkIcon, Download, Copy, Calendar, List, Star, Plus, Trash2 } from 'lucide-react';
import { Column } from '@/lib/types';
import { toast } from 'react-hot-toast';

export default function Modals() {
  const { 
    categoryModal, setCategoryModal, categories, setCategories,
    columnModal, setColumnModal, tables, currentTableId, setTables,
    rowCategoryModal, setRowCategoryModal,
    mediaPreviewModal, setMediaPreviewModal,
    confirmModal, setConfirmModal
  } = useAppContext();

  const table = tables.find(t => t.id === currentTableId);

  // Category Modal State
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#22c55e');
  const colors = ['#22c55e', '#ef4444', '#a855f7', '#3b82f6', '#f97316', '#eab308', '#ec4899', '#14b8a6', '#6366f1', '#64748b'];

  useLayoutEffect(() => {
    if (categoryModal.isOpen) {
      if (categoryModal.catId) {
        const c = categories.find(c => c.id === categoryModal.catId);
        if (c) { 
          setCatName(c.name); 
          setCatColor(c.color); 
        }
      } else {
        setCatName(''); 
        setCatColor('#22c55e');
      }
    }
  }, [categoryModal.isOpen, categoryModal.catId, categories]);

  const handleSaveCategory = useCallback(() => {
    if (!catName.trim()) { toast.error('กรุณาใส่ชื่อ'); return; }
    if (categoryModal.catId) {
      setCategories(categories.map(c => c.id === categoryModal.catId ? { ...c, name: catName, color: catColor } : c));
      toast.success('แก้ไขแล้ว ✅');
    } else {
      setCategories([...categories, { id: `cat-${Date.now()}`, name: catName, color: catColor }]);
      toast.success('เพิ่มหมวดหมู่แล้ว ✅');
    }
    setCategoryModal({ isOpen: false, catId: null });
  }, [catName, catColor, categoryModal.catId, categories, setCategories, setCategoryModal]);

  // Column Modal State
  const [colName, setColName] = useState('');
  const [colType, setColType] = useState<'text' | 'link' | 'date' | 'select' | 'rating'>('text');
  const [colOptions, setColOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  useLayoutEffect(() => {
    if (columnModal.isOpen && table) {
      if (columnModal.colId) {
        const c = table.columns.find(c => c.id === columnModal.colId);
        if (c) { 
          setColName(c.name); 
          setColType(c.type);
          setColOptions(c.options || []);
        }
      } else {
        setColName(''); 
        setColType('text');
        setColOptions([]);
      }
    }
  }, [columnModal.isOpen, columnModal.colId, table]);

  const handleSaveColumn = useCallback(() => {
    if (!colName.trim() || !table) { toast.error('กรุณาใส่ชื่อ'); return; }
    
    const getIcon = (type: string) => {
      switch(type) {
        case 'link': return 'Link';
        case 'date': return 'Calendar';
        case 'select': return 'List';
        case 'rating': return 'Star';
        default: return 'Type';
      }
    };

    if (columnModal.colId) {
      const newCols = table.columns.map(c => c.id === columnModal.colId ? { 
        ...c, 
        name: colName, 
        type: colType, 
        icon: getIcon(colType),
        options: colType === 'select' ? colOptions : undefined
      } : c);
      setTables(tables.map(t => t.id === table.id ? { ...t, columns: newCols } : t));
      toast.success('แก้ไขคอลัมน์แล้ว ✅');
    } else {
      const newCol: Column = { 
        id: `col-${Date.now()}`, 
        name: colName, 
        type: colType, 
        icon: getIcon(colType),
        options: colType === 'select' ? colOptions : undefined
      };
      const newRows = table.rows.map(r => ({ ...r, cells: { ...r.cells, [newCol.id]: '' } }));
      setTables(tables.map(t => t.id === table.id ? { ...t, columns: [...t.columns, newCol], rows: newRows } : t));
      toast.success('เพิ่มคอลัมน์แล้ว ✅');
    }
    setColumnModal({ isOpen: false, colId: null });
  }, [colName, colType, colOptions, columnModal.colId, table, tables, setTables, setColumnModal]);

  // Row Category Select
  const handleSelectRowCategory = (catId: string | null) => {
    if (!table || !rowCategoryModal.rowId) return;
    const newRows = table.rows.map(r => r.id === rowCategoryModal.rowId ? { ...r, categoryId: catId } : r);
    setTables(tables.map(t => t.id === table.id ? { ...t, rows: newRows } : t));
    setRowCategoryModal({ isOpen: false, rowId: null });
    if (catId) {
      const c = categories.find(c => c.id === catId);
      if (c) toast.success(`เปลี่ยนหมวดหมู่เป็น "${c.name}" ✅`);
    } else {
      toast.success('นำหมวดหมู่ออกแล้ว ✅');
    }
  };

  return (
    <>
      {/* Category Modal */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{categoryModal.catId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}</h3>
              <button onClick={() => setCategoryModal({ isOpen: false, catId: null })} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">ชื่อหมวดหมู่</label>
                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="เช่น ส่งเปิด, ส่งต่อ..." className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">สี</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button key={c} onClick={() => setCatColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${catColor === c ? 'border-zinc-900 dark:border-white scale-110 shadow-sm' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/50">
              <button onClick={() => setCategoryModal({ isOpen: false, catId: null })} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">ยกเลิก</button>
              <button onClick={handleSaveCategory} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Column Modal */}
      {columnModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{columnModal.colId ? 'แก้ไขคอลัมน์' : 'เพิ่มคอลัมน์'}</h3>
              <button onClick={() => setColumnModal({ isOpen: false, colId: null })} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">ชื่อคอลัมน์</label>
                <input type="text" value={colName} onChange={e => setColName(e.target.value)} placeholder="เช่น ผู้หญิง, ผู้ชาย..." className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">ประเภท</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setColType('text')} className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg text-sm font-medium transition-colors ${colType === 'text' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                    <Type size={16} /> ข้อความ
                  </button>
                  <button onClick={() => setColType('link')} className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg text-sm font-medium transition-colors ${colType === 'link' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                    <LinkIcon size={16} /> ลิงก์/ไฟล์
                  </button>
                  <button onClick={() => setColType('date')} className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg text-sm font-medium transition-colors ${colType === 'date' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                    <Calendar size={16} /> วันที่
                  </button>
                  <button onClick={() => setColType('select')} className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg text-sm font-medium transition-colors ${colType === 'select' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                    <List size={16} /> ตัวเลือก
                  </button>
                  <button onClick={() => setColType('rating')} className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg text-sm font-medium transition-colors ${colType === 'rating' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                    <Star size={16} /> คะแนน
                  </button>
                </div>
              </div>

              {colType === 'select' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-semibold text-zinc-500">รายการตัวเลือก</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newOption} 
                      onChange={e => setNewOption(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newOption.trim()) {
                          setColOptions([...colOptions, newOption.trim()]);
                          setNewOption('');
                        }
                      }}
                      placeholder="เพิ่มตัวเลือก..." 
                      className="flex-1 p-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={() => {
                        if (newOption.trim()) {
                          setColOptions([...colOptions, newOption.trim()]);
                          setNewOption('');
                        }
                      }}
                      className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-medium border border-indigo-100 dark:border-indigo-500/20">
                        {opt}
                        <button onClick={() => setColOptions(colOptions.filter((_, i) => i !== idx))} className="hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/50">
              <button onClick={() => setColumnModal({ isOpen: false, colId: null })} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">ยกเลิก</button>
              <button onClick={handleSaveColumn} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Row Category Modal */}
      {rowCategoryModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setRowCategoryModal({ isOpen: false, rowId: null })}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-[300px] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">เลือกหมวดหมู่</h3>
              <button onClick={() => setRowCategoryModal({ isOpen: false, rowId: null })} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"><X size={16} /></button>
            </div>
            <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
              <button onClick={() => handleSelectRowCategory(null)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 transition-colors text-left">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" /> ไม่มีหมวดหมู่
              </button>
              {categories.map(c => (
                <button key={c.id} onClick={() => handleSelectRowCategory(c.id)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 transition-colors text-left">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} /> {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {mediaPreviewModal.isOpen && mediaPreviewModal.media && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200" onClick={() => setMediaPreviewModal({ isOpen: false, media: null })}>
          <div className="bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-zinc-800" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col sm:flex-row items-center justify-between p-3 md:p-4 border-b border-zinc-800 bg-zinc-900/50 gap-3">
                <h3 className="font-medium text-zinc-200 truncate pr-4 w-full sm:w-auto">{mediaPreviewModal.media.name || 'ตัวอย่างไฟล์'}</h3>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button onClick={async () => {
                    const toastId = toast.loading('กำลังดาวน์โหลด...');
                    try {
                      const response = await fetch(mediaPreviewModal.media.src);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = blobUrl;
                      a.download = mediaPreviewModal.media.name || 'download';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(blobUrl);
                      document.body.removeChild(a);
                      toast.success('ดาวน์โหลดสำเร็จ! 📥', { id: toastId });
                    } catch (err) {
                      toast.error('ไม่สามารถดาวน์โหลดได้', { id: toastId });
                    }
                  }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors font-medium border border-zinc-700" title="ดาวน์โหลด">
                    <Download size={16} /> <span className="hidden sm:inline">บันทึกรูป</span><span className="sm:hidden">บันทึก</span>
                  </button>
                  {!mediaPreviewModal.media.type.startsWith('video') && (
                  <button onClick={() => {
                    fetch(mediaPreviewModal.media.src).then(res => res.blob()).then(blob => {
                      if (navigator.clipboard && navigator.clipboard.write) {
                        navigator.clipboard.write([new window.ClipboardItem({ [blob.type]: blob })])
                          .then(() => toast.success('คัดลอกรูปภาพแล้ว! 📸'))
                          .catch(() => toast.error('เบราว์เซอร์ไม่รองรับ กรุณาดาวน์โหลดแทน'));
                      }
                    });
                  }} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="คัดลอกรูป">
                    <Copy size={18} />
                  </button>
                )}
                <button onClick={() => setMediaPreviewModal({ isOpen: false, media: null })} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-black/50 min-h-[300px]">
              {mediaPreviewModal.media.type.startsWith('video') ? (
                <video src={mediaPreviewModal.media.src} controls autoPlay loop className="max-w-full max-h-[70vh] rounded-lg shadow-2xl" />
              ) : mediaPreviewModal.media.type.startsWith('image') ? (
                <img src={mediaPreviewModal.media.src} className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
                    <LinkIcon size={32} />
                  </div>
                  <p className="text-zinc-400 mb-6">ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้</p>
                  <a href={mediaPreviewModal.media.src} download={mediaPreviewModal.media.name || 'download'} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
                    <Download size={18} /> ดาวน์โหลดไฟล์
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                <X size={24} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">ยืนยันการทำรายการ</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{confirmModal.message}</p>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/50">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })} 
                className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, message: '', onConfirm: null });
                }} 
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
