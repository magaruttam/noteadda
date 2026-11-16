import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let doc: Document;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    doc = TestBed.inject(DOCUMENT);
    doc.documentElement.classList.remove('dark');
    doc.documentElement.removeAttribute('data-theme');
    service = TestBed.inject(ThemeService);
  });

  it('switches between dark and light themes on documentElement', () => {
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('noteadda_theme')).toBe('dark');

    service.toggleTheme();
    expect(service.theme()).toBe('light');
    expect(doc.documentElement.classList.contains('dark')).toBe(false);
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('noteadda_theme')).toBe('light');
  });
});
