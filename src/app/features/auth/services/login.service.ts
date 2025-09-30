import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

import { tap, map, Observable } from 'rxjs';
import { User } from '../models/user';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({ providedIn: 'root' })
export class LoginService {
    private readonly baseUrl = environment.api.baseUrl;
    private readonly currentUser = signal<User | null>(this.getUserFromStorage());

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
    ) {

    }

    login(username: string, password: string): Observable<User> {
        const url = `${this.baseUrl}${environment.api.auth.prefix}${environment.api.auth.endpoints.login}`;

        return this.http
            .post<ApiResponse<{ user: User; token: string }>>(url, { username, password })
            .pipe(
                tap(res => {
                    this.currentUser.set(res.data.user);
                    localStorage.setItem('current-user', JSON.stringify(res.data.user));
                    localStorage.setItem('app-token', res.data.token);
                }),
                map(res => res.data.user)
            );
    }
    logout() {
        // Clear all authentication data
        localStorage.removeItem('app-token');
        localStorage.removeItem('current-user');
        
        // Clear any other session data that might exist
        localStorage.removeItem('session-id');
        localStorage.removeItem('refresh-token');
        
        // Reset the current user signal
        this.currentUser.set(null);
        
        // Navigate to login page
        this.router.navigate(['/login']).then(() => {
            // Force reload to ensure clean state
            window.location.reload();
        });
    }
    getUserFromStorage(): User | null {
        const user = localStorage.getItem('current-user');
        return user ? JSON.parse(user) : null;
    }

    getCurrentUser(): User | null {
        return this.currentUser();
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('app-token');
        const user = localStorage.getItem('current-user');
        return !!(token && user);
    }

    readonly currentUser$ = this.currentUser.asReadonly();
}
