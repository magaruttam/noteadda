import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { AuthService } from '../../../../core/services/auth.service';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmCardImports,
    HlmBadge,
    HlmAlertImports,
    HlmLabel,
    HlmInput,
    HlmButtonImports,
    HlmSeparator,
  ],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  showPassword = false;
  showConfirmPassword = false;
  submitted = false;
  isSubmitting = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      fullName: [''],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  hasError(controlName: 'email' | 'username' | 'fullName' | 'password' | 'confirmPassword'): boolean {
    const control = this.form.controls[controlName];
    const mismatch = controlName === 'confirmPassword' && this.form.hasError('passwordMismatch');
    return (control.invalid || mismatch) && (control.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, username, fullName, password } = this.form.getRawValue();
    this.isSubmitting = true;

    this.authService
      .register({
        email: email.trim(),
        username: username.trim(),
        password,
        full_name: fullName.trim() || null,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          void this.router.navigate(['/login'], { queryParams: { registered: '1' } });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = this.authService.extractErrorMessage(
            err,
            'Registration failed. Please check your details and try again.',
          );
        },
      });
  }
}
