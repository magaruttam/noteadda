import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmSeparator } from '@spartan-ng/helm/separator';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink, HlmBadge, HlmSeparator],
  templateUrl: './site-footer.html',
})
export class SiteFooterComponent {}
