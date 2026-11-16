import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserProfile } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './my-account.html',
  styleUrl: './my-account.css',
})
export class MyAccountComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  savedMessage = '';
  avatarPreview = this.authService.userProfile().avatarUrl;

  readonly profileForm = this.fb.nonNullable.group({
    fullName: [this.authService.userProfile().fullName, [Validators.required, Validators.minLength(2)]],
    username: [this.authService.userProfile().username, [Validators.required, Validators.minLength(2)]],
    email: [this.authService.userProfile().email, [Validators.required, Validators.email]],
    university: [this.authService.userProfile().university],
    course: [this.authService.userProfile().course],
    role: [this.authService.userProfile().role],
    bio: [this.authService.userProfile().bio],
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
          bio: profile.bio,
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.avatarPreview = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.avatarPreview = '';
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
      bio: raw.bio.trim(),
      avatarUrl: this.avatarPreview,
    };

    this.authService.updateProfile(updated);
    this.savedMessage = 'Your personal information has been updated.';
    setTimeout(() => {
      this.savedMessage = '';
    }, 3500);
  }
}
