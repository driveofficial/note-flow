import { Category, Column, Table } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'ส่งเปิด', color: '#22c55e' },
  { id: 'cat-2', name: 'ส่งต่อ', color: '#22c55e' },
  { id: 'cat-3', name: 'ส่งรายละเอียด', color: '#a855f7' },
  { id: 'cat-4', name: 'ส่ง (จบ)', color: '#22c55e' },
];

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'col-name', name: 'ชื่อ', type: 'text', icon: 'Type', fixed: true },
  { id: 'col-1', name: 'ผู้หญิง', type: 'text', icon: 'User' },
  { id: 'col-2', name: 'ผู้ชาย', type: 'text', icon: 'User' },
  { id: 'col-3', name: 'ไฟล์และลิงก์', type: 'link', icon: 'Link' },
];

export const DEFAULT_TABLES: Table[] = [
  {
    id: 'tbl-1',
    title: 'ส่งรายละเอียด SENTINA หมวด S',
    icon: '📋',
    columns: DEFAULT_COLUMNS,
    rows: [
      {
        id: 'r1', categoryId: 'cat-1',
        cells: {
          'col-name': 'ส่งเปิด Step1 คีย์ลัด s1',
          'col-1': 'ได้เลยจ้า งั้นหนูขออนุญาตแนะนำ',
          'col-2': 'ได้เลยครับ งั้นผมขออนุญาตแนะนำ',
          'col-3': '',
        }
      },
      {
        id: 'r2', categoryId: 'cat-2',
        cells: {
          'col-name': 'ส่งต่อ Step 1',
          'col-1': '',
          'col-2': '',
          'col-3': '',
        }
      },
      {
        id: 'r3', categoryId: 'cat-3',
        cells: {
          'col-name': 'ส่งต่อ คีย์ลัด s2',
          'col-1': 'เคล็ดลับดูแลหุ่นและผิวด้วย Sentir',
          'col-2': 'เคล็ดลับดูแลหุ่นและผิวด้วย Sentir',
          'col-3': '',
        }
      },
      {
        id: 'r4', categoryId: 'cat-2',
        cells: {
          'col-name': 'ส่งต่อ s2',
          'col-1': '',
          'col-2': '',
          'col-3': '',
        }
      },
      {
        id: 'r5', categoryId: 'cat-3',
        cells: {
          'col-name': 'ส่งต่อ คีย์ลัด s3',
          'col-1': 'คนนี้ชื่อป้าเอ่นะคะ ทานแค่ 11 วัน',
          'col-2': 'คนนี้ชื่อป้าเอ่นะครับ ทานแค่ 11 วัน',
          'col-3': '',
        }
      },
      {
        id: 'r6', categoryId: 'cat-2',
        cells: {
          'col-name': 'ส่งต่อ Step3',
          'col-1': '',
          'col-2': '',
          'col-3': '',
        }
      },
      {
        id: 'r7', categoryId: 'cat-3',
        cells: {
          'col-name': 'ส่งต่อ คีย์ลัด s4',
          'col-1': '"ดูแลรูปร่างแบบฉบับสายเฮลตี้ 💜"',
          'col-2': '"ดูแลรูปร่างแบบฉบับสายเฮลตี้ 💜"',
          'col-3': '',
        }
      },
      {
        id: 'r8', categoryId: 'cat-3',
        cells: {
          'col-name': 'ส่งต่อ คีย์ลัด s5',
          'col-1': '✨♡ ราคาโปรโมชั่น♡.✨ 🔥เซตเปิด',
          'col-2': '✨♡ ราคาโปรโมชั่น♡.✨ 🔥เซตเปิด',
          'col-3': '',
        }
      },
      {
        id: 'r9', categoryId: 'cat-3',
        cells: {
          'col-name': 'ส่งต่อ คีย์ลัด s6',
          'col-1': 'เซต 1 เดือนเห็นความต่างแน่นอนค่ะ',
          'col-2': 'เซต 1 เดือนเห็นความต่างแน่นอนครับ',
          'col-3': '',
        }
      },
      {
        id: 'r10', categoryId: 'cat-3',
        cells: {
          'col-name': 'ส่งต่อ คีย์ลัด s8',
          'col-1': '✨ ดูผลลัพธ์ลูกค้าหนูนะคะ เปลี่ยน',
          'col-2': '✨ ดูผลลัพธ์ลูกค้าผมนะครับ เปลี่ยน',
          'col-3': '',
        }
      },
      {
        id: 'r11', categoryId: 'cat-3',
        cells: {
          'col-name': 'ส่งต่อ คีย์ลัด s9',
          'col-1': 'ถ้าอยากเน้นความต่อเนื่อง หนูแนะนำ',
          'col-2': 'ถ้าอยากเน้นความต่อเนื่อง ผมแนะนำ',
          'col-3': '',
        }
      },
      {
        id: 'r12', categoryId: 'cat-4',
        cells: {
          'col-name': 'ส่งต่อ (จบ) คีย์ลัด s10',
          'col-1': 'พี่สนใจเริ่มต้นทานกับหนูเป็นเซตไหนดีคะ',
          'col-2': 'พี่สนใจเริ่มต้นทานกับผมเป็นเซตไหนดีครับ',
          'col-3': '',
        }
      },
    ]
  }
];
