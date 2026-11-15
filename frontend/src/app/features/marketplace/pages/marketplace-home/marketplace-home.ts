import { Component } from '@angular/core';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { MarketplaceHeroComponent } from '../../components/marketplace-hero/marketplace-hero';
import { NoteCardComponent } from '../../components/note-card/note-card';
import { categories, notes } from '../../data/marketplace.data';
import { Note } from '../../models/marketplace.model';

type SortOption = 'popular' | 'rating' | 'price-low' | 'price-high';

@Component({
  selector: 'app-marketplace-home',
  standalone: true,
  imports: [SiteHeaderComponent, MarketplaceHeroComponent, NoteCardComponent],
  templateUrl: './marketplace-home.html',
  styleUrl: './marketplace-home.css',
})
export class MarketplaceHomeComponent {
  readonly categories = categories;
  readonly notes = notes;
  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Most popular' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'price-low', label: 'Price: low to high' },
    { value: 'price-high', label: 'Price: high to low' },
  ];

  searchQuery = '';
  activeCategory = 'all';
  sortBy: SortOption = 'popular';
  selectedNote: Note | null = null;

  get filteredNotes(): Note[] {
    const query = this.searchQuery.trim().toLowerCase();
    const filtered = this.notes.filter((note) => {
      const matchesCategory = this.activeCategory === 'all' || note.category === this.activeCategory;
      const matchesQuery =
        !query ||
        [note.title, note.course, note.university, note.seller].some((value) =>
          value.toLowerCase().includes(query),
        );
      return matchesCategory && matchesQuery;
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

  onSortChange(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value as SortOption;
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeCategory = 'all';
  }

  closePreview(): void {
    this.selectedNote = null;
  }
}
