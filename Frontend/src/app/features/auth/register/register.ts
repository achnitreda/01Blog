import { Component, computed, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../../shared/models';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  registerForm!: FormGroup;

  // Signals for reactive state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  hidePassword = signal(true);

  // Password strength
  passwordStrength = signal(0);
  passwordStrengthText = computed(() => {
    const strength = this.passwordStrength();
    if (strength === 0) return '';
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Medium';
    if (strength < 80) return 'Good';
    return 'Strong';
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_]+$/), // Alphanumeric and underscore only
        ],
      ],
      email: ['', [Validators.required, this.emailValidator]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), this.passwordStrengthValidator],
      ],
    });

    // Watch password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe((password) => {
      this.passwordStrength.set(this.calculatePasswordStrength(password));
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/feed']);
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading.set(true);

    const userData: RegisterRequest = {
      username: this.registerForm.value.username.trim(),
      email: this.registerForm.value.email.trim().toLowerCase(),
      password: this.registerForm.value.password,
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Registration failed. Please try again.');
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength();
    if (strength < 30) return 'warn';
    if (strength < 60) return 'accent';
    if (strength < 80) return 'primary';

    return 'primary';
  }

  private emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    // More strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? null : { invalidEmail: true };
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const errors: ValidationErrors = {};

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors['noLowercase'] = true;
    }

    // Must contain at least one number
    if (!/\d/.test(password)) {
      errors['noNumber'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (fieldName === 'username') {
      if (field.hasError('minlength')) return 'Username must be at least 3 characters';
      if (field.hasError('maxlength')) return 'Username must be less than 20 characters';
      if (field.hasError('pattern'))
        return 'Username can only contain letters, numbers, and underscores';
    }

    if (fieldName === 'email') {
      if (field.hasError('email') || field.hasError('invalidEmail')) {
        return 'Please enter a valid email address';
      }
    }

    if (fieldName === 'password') {
      if (field.hasError('minlength')) return 'Password must be at least 6 characters';
      if (field.hasError('noUppercase'))
        return 'Password must contain at least one uppercase letter';
      if (field.hasError('noLowercase'))
        return 'Password must contain at least one lowercase letter';
      if (field.hasError('noNumber')) return 'Password must contain at least one number';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      password: 'Password',
    };
    return labels[fieldName] || fieldName;
  }

  getPasswordRequirements() {
    const password = this.registerForm.get('password')?.value || '';

    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
  }

  private calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 10;

    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    return Math.min(strength, 100);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
