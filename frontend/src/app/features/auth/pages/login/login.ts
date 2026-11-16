import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  showPassword = false;
  submitted = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly form = this.fb.nonNullable.group({
    emailOrUsername: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
    remember: [true],
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('registered') === '1') {
      this.successMessage = 'Account created successfully! Please sign in.';
    }
  }

  hasError(controlName: 'emailOrUsername' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { emailOrUsername, password, remember } = this.form.getRawValue();
    this.isSubmitting = true;

    this.authService
      .login({ email_or_username: emailOrUsername.trim(), password }, remember)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          void this.router.navigate(['/']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = this.authService.extractErrorMessage(
            err,
            'Invalid credentials. Please check your email/username and password.',
          );
        },
      });
  }
}
