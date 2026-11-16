import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {
  CategoryApiResponse,
  NoteApiResponse,
  NoteCreatePayload,
  NoteReviewApiResponse,
  NoteReviewCreatePayload,
  NoteUpdatePayload,
  NotesListParams,
} from '../models/note.model';
import { Note } from '../../features/marketplace/models/marketplace.model';

const CATEGORY_ID_TO_SLUG: Record<number, string> = {
  1: 'csit',
  2: 'engineering',
  3: 'management',
  4: 'medical',
  5: 'science',
  6: 'humanities',
  7: 'law',
};

const CATEGORY_SLUG_TO_ID: Record<string, number> = Object.fromEntries(
  Object.entries(CATEGORY_ID_TO_SLUG).map(([id, slug]) => [slug, Number(id)]),
);

const COVER_COLORS = ['indigo', 'emerald', 'blue', 'slate', 'amber', 'rose', 'violet', 'cyan'];

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly notesUrl = `${API_CONFIG.baseUrl}/notes`;
  private readonly categoriesUrl = `${API_CONFIG.baseUrl}/categories`;

  listCategories(activeOnly = true): Observable<CategoryApiResponse[]> {
    const params = new HttpParams().set('active_only', String(activeOnly));
    return this.http.get<CategoryApiResponse[]>(`${this.categoriesUrl}/`, { params });
  }

  listNotes(params?: NotesListParams): Observable<NoteApiResponse[]> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return this.http.get<NoteApiResponse[]>(`${this.notesUrl}/`, { params: httpParams });
  }

  getNote(noteId: number): Observable<NoteApiResponse> {
    return this.http.get<NoteApiResponse>(`${this.notesUrl}/${noteId}`);
  }

  createNote(payload: NoteCreatePayload): Observable<NoteApiResponse> {
    return this.http.post<NoteApiResponse>(`${this.notesUrl}/`, payload);
  }

  updateNote(noteId: number, payload: NoteUpdatePayload): Observable<NoteApiResponse> {
    return this.http.patch<NoteApiResponse>(`${this.notesUrl}/${noteId}`, payload);
  }

  deleteNote(noteId: number): Observable<void> {
    return this.http.delete<void>(`${this.notesUrl}/${noteId}`);
  }

  listReviews(noteId: number): Observable<NoteReviewApiResponse[]> {
    return this.http.get<NoteReviewApiResponse[]>(`${this.notesUrl}/${noteId}/reviews`);
  }

  submitReview(noteId: number, payload: NoteReviewCreatePayload): Observable<NoteReviewApiResponse> {
    return this.http.post<NoteReviewApiResponse>(`${this.notesUrl}/${noteId}/reviews`, payload);
  }

  getCategoryIdFromSlug(slug: string): number {
    return CATEGORY_SLUG_TO_ID[slug] ?? 1;
  }

  getCategorySlugFromId(categoryId: number): string {
    return CATEGORY_ID_TO_SLUG[categoryId] ?? 'csit';
  }

  mapApiNoteToMarketplaceNote(
    apiNote: NoteApiResponse,
    currentUserId?: number,
    categorySlugById?: Record<number, string>,
  ): Note {
    const isOwner = currentUserId !== undefined && apiNote.seller_id === currentUserId;
    return {
      id: String(apiNote.id),
      title: apiNote.title,
      course: apiNote.course_id ? `Course #${apiNote.course_id}` : 'Study Notes',
      semester: apiNote.semester || 'All Semesters',
      university: apiNote.institution_id ? `Institute #${apiNote.institution_id}` : 'NoteAdda',
      seller:
        apiNote.seller?.username ||
        apiNote.seller?.full_name ||
        (isOwner ? 'You' : `Seller #${apiNote.seller_id}`),
      category: categorySlugById?.[apiNote.category_id] ?? this.getCategorySlugFromId(apiNote.category_id),
      pages: apiNote.pages,
      price: apiNote.price,
      originalPrice: apiNote.original_price ?? undefined,
      rating: Number(apiNote.rating) || 0,
      reviews: apiNote.reviews_count,
      downloads: apiNote.downloads_count,
      color: COVER_COLORS[apiNote.id % COVER_COLORS.length],
      badge: apiNote.status !== 'published' ? apiNote.status.toUpperCase() : undefined,
      summary: apiNote.summary,
    };
  }
}
