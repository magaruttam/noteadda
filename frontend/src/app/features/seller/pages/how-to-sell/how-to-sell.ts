import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { AuthService } from '../../../../core/services/auth.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';

interface SellStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  checklist: string[];
  ctaLabel?: string;
  ctaLink?: string;
}

interface SellFaq {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-how-to-sell',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent, HlmBadge, HlmButtonImports, HlmCardImports],
  templateUrl: './how-to-sell.html',
})
export class HowToSellComponent {
  readonly authService = inject(AuthService);

  readonly steps: SellStep[] = [
    {
      step: 1,
      title: 'Prepare Your Study Material',
      subtitle: 'Organize & export as PDF',
      description:
        'Gather your cleanest semester notes, lecture summaries, diagrams, or solved past board questions into a single, easy-to-read PDF.',
      checklist: [
        'Export or scan clearly in PDF format (up to 50 MB)',
        'Include a clear table of contents or chapter breakdown',
        'Check page count and remove blurry or duplicate pages',
      ],
    },
    {
      step: 2,
      title: 'Sign In to Your NoteAdda Account',
      subtitle: 'Use your student or teacher profile',
      description:
        'Your username appears on every study book you publish, helping students recognize and trust your notes across Nepal.',
      checklist: [
        'Register for free or log in with your email/username',
        'Complete your university and course details in My Account',
      ],
      ctaLabel: 'Create free account',
      ctaLink: '/register',
    },
    {
      step: 3,
      title: 'Open Seller Studio & Add Details',
      subtitle: 'Set category, title & NPR price',
      description:
        'Head to Seller Studio and click "+ Create new note". Choose the right Nepal-wide category so students can find your book quickly.',
      checklist: [
        'Pick the exact Category (School & +2, IT & Computing, Engineering, etc.)',
        'Write a descriptive title and list what chapters/papers are included',
        'Set your Selling Price in Rs. (and optional Original Price to show a Save % badge)',
      ],
      ctaLabel: 'Open Seller Studio',
      ctaLink: '/seller',
    },
    {
      step: 4,
      title: 'Upload PDF & Customize Book Cover',
      subtitle: 'Preview your listing live',
      description:
        'Attach your PDF file, pick a cover color, and optionally add an achievement badge (like "TU Board Rank 2" or "PU 3.94 GPA").',
      checklist: [
        'Attach your study note PDF from your device',
        'Choose a book cover color that stands out in the catalog',
        'Review the Live Store Preview card on the right before saving',
      ],
    },
    {
      step: 5,
      title: 'Publish to the Marketplace',
      subtitle: 'Go live or save as draft',
      description:
        'Choose "Publish immediately" to list your note on the public homepage and catalog, or "Save as draft" to finish editing later.',
      checklist: [
        'Published notes appear immediately on the Home & All Notes pages',
        'Edit price, description, or toggle Publish/Unpublish anytime',
      ],
    },
    {
      step: 6,
      title: 'Track Sales, Views & Earnings',
      subtitle: 'Monitor performance in real time',
      description:
        'Click any note in Seller Studio to open its Analytics modal—track page views, conversion rate, copies sold, and your 85% net earnings.',
      checklist: [
        'View total published books, copies sold, and gross revenue',
        'Inspect 6-month sales trends and student star ratings',
        'Keep notes updated each semester to earn repeat buyers',
      ],
    },
  ];

  readonly tips = [
    {
      title: 'Price fairly for students',
      body: 'Most top-selling semester notes are priced between Rs. 149 and Rs. 349. Adding an original price highlights the discount percentage.',
    },
    {
      title: 'Be specific in your summary',
      body: 'Mention exact chapters, solved past-year board questions, and whether diagrams or formulas are included.',
    },
    {
      title: 'Use your achievement badge',
      body: 'If you topped your college or board exam, add a short badge (e.g., "IOE Rank 12" or "KU Dean\'s List") to build instant trust.',
    },
  ];

  readonly faqs: SellFaq[] = [
    {
      question: 'What file format should I upload?',
      answer:
        'PDF (.pdf) up to 50 MB works best so students can read your notes cleanly on laptops, tablets, and phones.',
    },
    {
      question: 'How much do sellers earn per sale?',
      answer:
        'Sellers keep 85% of every sale (shown as Net Earnings in your Seller Studio analytics), while 15% covers platform hosting and payment processing.',
    },
    {
      question: 'Can I edit or unpublish a note after publishing?',
      answer:
        'Yes. In Seller Studio, you can edit any note’s title, price, or description, switch it back to Draft, or delete it at any time.',
    },
    {
      question: 'Do I have to fill in University, Course, and Semester?',
      answer:
        'No—those fields are optional. Only Title, Category, Selling Price, Total Pages, and Description are required.',
    },
  ];
}
