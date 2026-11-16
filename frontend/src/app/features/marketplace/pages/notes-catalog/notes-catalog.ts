import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { NoteCardComponent } from '../../components/note-card/note-card';
import { MarketplaceCategory, Note } from '../../models/marketplace.model';

type SortOption = 'popular' | 'rating' | 'price-low' | 'price-high';
type DropdownKey = 'institute' | 'course' | 'sort';

@Component({
  selector: 'app-notes-catalog',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent, NoteCardComponent],
  templateUrl: './notes-catalog.html',
  styleUrl: './notes-catalog.css',
})
export class NotesCatalogComponent implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly notesService = inject(NotesService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: MarketplaceCategory[] = [{ id: 'all', label: 'All Notes', count: '0' }];
  notes: Note[] = [];

  institutes: string[] = [];
  courses: string[] = [];

  ngOnInit(): void {
    forkJoin({
      categories: this.notesService.listCategories(),
      notes: this.notesService.listNotes({ status: 'published', limit: 100 }),
    }).subscribe({
      next: ({ categories: apiCats, notes: apiNotes }) => {
        const slugById: Record<number, string> = {};
        for (const cat of apiCats) {
          slugById[cat.id] = cat.slug;
        }
        this.notes = apiNotes.map((n) =>
          this.notesService.mapApiNoteToMarketplaceNote(n, undefined, slugById),
        );
        this.categories = [
          { id: 'all', label: 'All Notes', count: String(this.notes.length) },
          ...apiCats.map((cat) => ({
            id: cat.slug,
            label: cat.name,
            count: String(this.notes.filter((n) => n.category === cat.slug).length),
          })),
        ];
        this.institutes = Array.from(new Set(this.notes.map((n) => n.university))).sort();
        this.courses = Array.from(new Set(this.notes.map((n) => n.course))).sort();
        this.cdr.markForCheck();
      },
      error: () => {
        this.notes = [];
        this.institutes = [];
        this.courses = [];
        this.cdr.markForCheck();
      },
    });
  }

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Most popular' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'price-low', label: 'Price: low to high' },
    { value: 'price-high', label: 'Price: high to low' },
  ];

  searchQuery = '';
  activeCategory = 'all';
  selectedInstitute = 'all';
  selectedCourse = 'all';
  sortBy: SortOption = 'popular';
  openDropdown: DropdownKey | null = null;
  selectedNote: Note | null = null;

  get activeSortLabel(): string {
    return this.sortOptions.find((option) => option.value === this.sortBy)?.label ?? 'Most popular';
  }

  get hasActiveFilters(): boolean {
    return (
      Boolean(this.searchQuery.trim()) ||
      this.activeCategory !== 'all' ||
      this.selectedInstitute !== 'all' ||
      this.selectedCourse !== 'all'
    );
  }

  get filteredNotes(): Note[] {
    const query = this.searchQuery.trim().toLowerCase();
    const filtered = this.notes.filter((note) => {
      const matchesCategory = this.activeCategory === 'all' || note.category === this.activeCategory;
      const matchesInstitute =
        this.selectedInstitute === 'all' || note.university === this.selectedInstitute;
      const matchesCourse = this.selectedCourse === 'all' || note.course === this.selectedCourse;
      const matchesQuery =
        !query ||
        [note.title, note.course, note.university, note.seller, note.semester, note.summary].some(
          (value) => value.toLowerCase().includes(query),
        );

      return matchesCategory && matchesInstitute && matchesCourse && matchesQuery;
    });

    return filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return b.downloads - a.downloads;
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  onCategorySelect(category: string): void {
    this.activeCategory = category;
  }

  toggleDropdown(key: DropdownKey): void {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  selectInstitute(value: string): void {
    this.selectedInstitute = value;
    this.openDropdown = null;
  }

  selectCourse(value: string): void {
    this.selectedCourse = value;
    this.openDropdown = null;
  }

  selectSort(value: SortOption): void {
    this.sortBy = value;
    this.openDropdown = null;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeCategory = 'all';
    this.selectedInstitute = 'all';
    this.selectedCourse = 'all';
  }

  openNoteDetail(note: Note): void {
    this.router.navigate(['/notes', note.id]);
  }

  closePreview(): void {
    this.selectedNote = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.openDropdown) return;
    const menus = this.elementRef.nativeElement.querySelectorAll('.filter-dropdown');
    const clickedInside = Array.from<Element>(menus).some((el) =>
      el.contains(event.target as Node),
    );
    if (!clickedInside) {
      this.openDropdown = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.openDropdown) {
      this.openDropdown = null;
    }
    if (this.selectedNote) {
      this.closePreview();
    }
  }
}
