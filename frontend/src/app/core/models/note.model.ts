export type ApiNoteStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export interface NoteFilePayload {
  file_name: string;
  file_key: string;
  file_type: string;
  file_size: number;
  is_primary?: boolean;
}

export interface NoteFileResponse extends NoteFilePayload {
  id: number;
  note_id: number;
  is_primary: boolean;
  created_at: string;
}

export interface NoteImagePayload {
  image_key: string;
  alt_text?: string | null;
  sort_order?: number;
}

export interface NoteImageResponse extends NoteImagePayload {
  id: number;
  note_id: number;
  sort_order: number;
  created_at: string;
}

export interface NoteCreatePayload {
  category_id: number;
  institution_id?: number | null;
  course_id?: number | null;
  title: string;
  slug?: string | null;
  summary: string;
  description?: string | null;
  semester?: string | null;
  pages: number;
  price: number;
  original_price?: number | null;
  currency?: string;
  status?: ApiNoteStatus;
  files?: NoteFilePayload[];
  images?: NoteImagePayload[];
}

export interface NoteUpdatePayload {
  category_id?: number | null;
  institution_id?: number | null;
  course_id?: number | null;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  description?: string | null;
  semester?: string | null;
  pages?: number | null;
  price?: number | null;
  original_price?: number | null;
  currency?: string | null;
  status?: ApiNoteStatus | null;
  rejection_reason?: string | null;
}

export interface NoteSellerResponse {
  id: number;
  username: string;
  full_name: string | null;
}

export interface NoteApiResponse {
  id: number;
  seller_id: number;
  seller?: NoteSellerResponse | null;
  category_id: number;
  institution_id: number | null;
  course_id: number | null;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  semester: string | null;
  pages: number;
  price: number;
  original_price: number | null;
  currency: string;
  rating: string | number;
  reviews_count: number;
  downloads_count: number;
  views_count: number;
  status: ApiNoteStatus;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  files: NoteFileResponse[];
  images: NoteImageResponse[];
}

export interface NotesListParams {
  skip?: number;
  limit?: number;
  category_id?: number;
  institution_id?: number;
  course_id?: number;
  seller_id?: number;
  status?: ApiNoteStatus;
  search?: string;
}

export interface CategoryApiResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  created_at: string;
}

export interface NoteReviewCreatePayload {
  rating: number;
  comment?: string | null;
}

export interface NoteReviewApiResponse {
  id: number;
  note_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  user?: NoteSellerResponse | null;
  created_at: string;
  updated_at: string;
}
