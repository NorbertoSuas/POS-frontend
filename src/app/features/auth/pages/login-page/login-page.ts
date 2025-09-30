import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '../../../../core/services/auth';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'page-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  loading = signal(false);
  error = signal('');

  private fb = inject(FormBuilder);
  private authApp = inject(AuthService);
  private userAuth = inject(LoginService);
  private router = inject(Router);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit() {
    if (this.form.invalid) {
      this.error.set('Please complete all fields correctly.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.userAuth.login(
      this.form.value.username!,
      this.form.value.password!
    ).pipe(
      tap(() => this.router.navigate(['/admin-panel'])),
      catchError((err) => {
        console.error('❌ Login error:', err);
        this.error.set('Login failed. Please try again.');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();


  }
}