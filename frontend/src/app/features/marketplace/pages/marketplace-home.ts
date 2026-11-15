import { Component } from '@angular/core';
import { NoteCardComponent } from '../components/note-card';
import { MarketplaceHeroComponent } from '../components/marketplace-hero';
import { SiteHeaderComponent } from '../components/site-header';
import { categories, faqs, notes, testimonials } from '../data/marketplace.data';
import { Note } from '../models/marketplace.model';

type SortOption = 'popular' | 'rating' | 'price-low' | 'price-high';
type CalculatorField = 'sets' | 'price' | 'downloads';

@Component({
  selector: 'app-marketplace-home',
  standalone: true,
  imports: [SiteHeaderComponent, MarketplaceHeroComponent, NoteCardComponent],
  templateUrl: './marketplace-home.html',
})
export class MarketplaceHomeComponent {
  readonly categories = categories;
  readonly notes = notes;
  readonly testimonials = testimonials;
  readonly faqs = faqs;
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
  openFaq = 0;
  calculatorSets = 4;
  calculatorPrice = 199;
  calculatorDownloads = 40;

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

  get estimatedEarnings(): number {
    return this.calculatorSets * this.calculatorPrice * this.calculatorDownloads;
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

  updateCalculator(field: CalculatorField, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (field === 'sets') this.calculatorSets = value;
    if (field === 'price') this.calculatorPrice = value;
    if (field === 'downloads') this.calculatorDownloads = value;
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeCategory = 'all';
  }

  toggleFaq(index: number): void {
    this.openFaq = this.openFaq === index ? -1 : index;
  }

  closePreview(): void {
    this.selectedNote = null;
  }
}
