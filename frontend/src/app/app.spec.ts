import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { MarketplaceHomeComponent } from './features/marketplace/pages/marketplace-home/marketplace-home';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, MarketplaceHomeComponent],
      providers: [provideRouter(routes)],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the marketplace homepage', async () => {
    const fixture = TestBed.createComponent(MarketplaceHomeComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Better notes.');
  });
});
