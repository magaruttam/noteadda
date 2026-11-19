import { NoteImageResponse } from '../../../core/models/note.model';
import { Note } from '../../marketplace/models/marketplace.model';

export type SellerNoteStatus = 'published' | 'draft';

export interface SellerNote extends Note {
  categoryId: number;
  status: SellerNoteStatus;
  fileName: string;
  images: NoteImageResponse[];
  updatedAt: string;
}
