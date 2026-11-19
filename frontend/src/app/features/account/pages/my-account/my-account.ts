import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { UserProfile } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmAlertImports,
    HlmAvatarImports,
    HlmLabel,
    HlmInput,
    HlmSeparator,
  ],
  templateUrl: './my-account.html',
})
export class MyAccountComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  savedMessage = '';
  avatarError = '';
  avatarUploading = false;
  avatarPreview = this.authService.userProfile().avatarUrl;

  readonly profileForm = this.fb.nonNullable.group({
    fullName: [this.authService.userProfile().fullName, [Validators.required, Validators.minLength(2)]],
    username: [this.authService.userProfile().username, [Validators.required, Validators.minLength(2)]],
    email: [this.authService.userProfile().email, [Validators.required, Validators.email]],
    university: [this.authService.userProfile().university],
    course: [this.authService.userProfile().course],
    role: [this.authService.userProfile().role],
  });

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) return;

    this.authService.fetchCurrentUser().subscribe({
      next: () => {
        const profile = this.authService.userProfile();
        this.avatarPreview = profile.avatarUrl;
        this.profileForm.patchValue({
          fullName: profile.fullName,
          username: profile.username,
          email: profile.email,
          university: profile.university,
          course: profile.course,
          role: profile.role,
        });
      },
      error: () => {
        // Keep stored profile if backend is unreachable
      },
    });
  }

  get initials(): string {
    const name = this.profileForm.controls.fullName.value.trim() || this.profileForm.controls.username.value.trim();
    return (name.charAt(0) || 'U').toUpperCase();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.avatarError = '';
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowedTypes.has(file.type)) {
      this.avatarError = 'Please choose a JPEG, PNG, WEBP, or GIF image.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.avatarError = 'Image size must be 5 MB or less.';
      return;
    }

    const previousAvatar = this.avatarPreview;
    const objectUrl = URL.createObjectURL(file);
    this.avatarPreview = objectUrl;

    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.avatarUploading = true;
    this.authService.uploadProfileImage(file).subscribe({
      next: (user) => {
        URL.revokeObjectURL(objectUrl);
        this.avatarPreview = user.profile_image_url ?? '';
        this.avatarUploading = false;
        this.showSavedMessage('Profile photo updated.');
      },
      error: (err) => {
        URL.revokeObjectURL(objectUrl);
        this.avatarPreview = previousAvatar;
        this.avatarUploading = false;
        this.avatarError = this.authService.extractErrorMessage(err, 'Failed to upload profile photo.');
      },
    });
  }

  removeAvatar(): void {
    this.avatarError = '';
    if (!this.authService.isAuthenticated()) {
      this.avatarPreview = '';
      return;
    }

    this.avatarUploading = true;
    this.authService.deleteProfileImage().subscribe({
      next: () => {
        this.avatarPreview = '';
        this.avatarUploading = false;
        this.showSavedMessage('Profile photo removed.');
      },
      error: (err) => {
        this.avatarUploading = false;
        this.avatarError = this.authService.extractErrorMessage(err, 'Failed to remove profile photo.');
      },
    });
  }

  private showSavedMessage(message: string): void {
    this.savedMessage = message;
    setTimeout(() => {
      this.savedMessage = '';
    }, 3500);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    const updated: UserProfile = {
      fullName: raw.fullName.trim(),
      username: raw.username.trim().replace(/^@/, ''),
      email: raw.email.trim(),
      university: raw.university.trim(),
      course: raw.course.trim(),
      role: raw.role,
      bio: this.authService.userProfile().bio,
      avatarUrl: this.avatarPreview,
    };

    this.authService.updateProfile(updated);
    this.savedMessage = 'Your personal information has been updated.';
    setTimeout(() => {
      this.savedMessage = '';
    }, 3500);
  }
}
