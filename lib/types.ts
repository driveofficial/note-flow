export type Role = 'admin' | 'user' | null;

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Column {
  id: string;
  name: string;
  type: 'text' | 'link' | 'date' | 'select' | 'rating';
  icon: string;
  fixed?: boolean;
  options?: string[];
}

export interface MediaItem {
  type: string;
  name: string;
  src: string;
}

export interface Row {
  id: string;
  categoryId: string | null;
  cells: Record<string, string>;
}

export interface Table {
  id: string;
  title: string;
  icon: string;
  columns: Column[];
  rows: Row[];
}
