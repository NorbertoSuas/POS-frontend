import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Employee } from '../models/employee';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/models/api-response';
import { UserDto } from '../models/userDto';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    environment.api.baseUrl +
    environment.api.users.prefix +
    environment.api.users.users.prefix;
  private readonly endpoints = environment.api.users.users.endpoints;
  usersTableRow = signal<UserTableRow[]>([]);

  getAllUsersTableRow(): Observable<UserTableRow[]> {
    return this.http
      .get<ApiResponse<UserTableRow[]>>(
        this.baseUrl + this.endpoints.getAllUsersTableRow
      )
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          this.usersTableRow.set(res.data);
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }
  getUserDtoById(id: string): Observable<UserDto> {
    return this.http
      .get<ApiResponse<UserDto>>(
        this.baseUrl + this.endpoints.getUserDtoById(id)
      )
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }
  getUserById(id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(this.baseUrl + this.endpoints.getById(id))
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }
  deleteUser(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<null>>(
        this.baseUrl + this.endpoints.delete(String(id))
      )
      .pipe(
        map((res: ApiResponse<null>) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          this.usersTableRow.update((list) => list.filter((e) => e.id !== id));
          return true;
        }),
        catchError((err) => {
          console.error('Error deleting user:', err.message);
          return throwError(() => err);
        })
      );
  }

  saveUser(user: User): Observable<UserTableRow> {
    console.log('Saving user:', user);
    return this.http
      .patch<ApiResponse<UserTableRow>>(
        this.baseUrl + this.endpoints.upsert,
        user
      )
      .pipe(
        map((res: ApiResponse<UserTableRow>) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }

          const savedUser = res.data;

          if (user.id) {
            // Update existing user in the signal
            this.usersTableRow.update((list) =>
              list.map((e) => (e.id === user.id ? savedUser : e))
            );
          } else {
            // Add new user
            this.usersTableRow.update((list) => [...list, savedUser]);
          }

          return savedUser;
        }),
        catchError((err) => {
          console.error('Error saving user:', err.message);
          return throwError(() => err);
        })
      );
  }
}
