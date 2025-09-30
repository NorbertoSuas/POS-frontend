import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.api.baseUrl;
  private readonly accessKey = environment.accessKey;
  private readonly accessSecret = environment.accessSecret;

  private appToken = signal<string | null>(localStorage.getItem('app-token'));

  constructor(private http: HttpClient, private router: Router) {

  }

  // Get application token
  authenticateApp(): Observable<string> {
    // If we already have a token, return it
    if (this.appToken()) {
      return of(this.appToken()!);
    }


    const url = `${this.baseUrl}${environment.api.token.prefix}${environment.api.token.endpoints.getToken}`;
    const body = {
      accessKey: this.accessKey,
      accessSecret: this.accessSecret
    };

    return this.http.post<any>(url, body).pipe(
      map(res => {
        const token = res?.data?.jwtToken;
        if (!token) throw new Error('No token in response');
        this.appToken.set(token);
        localStorage.setItem('app-token', token);
        return token;
      }),
      catchError(error => {
        console.error('❌ Error getting application token:', error);
        // In development, if authentication fails, use a mock token
        if (environment.production === false) {
          const mockToken = 'mock-jwt-token-for-development';
          this.appToken.set(mockToken);
          localStorage.setItem('app-token', mockToken);
          console.log('🔧 Using mock token after authentication error');
          return of(mockToken);
        }
        throw error;
      })
    );
  }

  getAppToken(): string | null {
    return this.appToken();
  }
isAuthenticated(): boolean {
  return !!localStorage.getItem('app-token');
}

  readonly appToken$ = this.appToken.asReadonly();
}
