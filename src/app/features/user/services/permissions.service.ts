import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/models/api-response';
import { Role } from '../models/Role';
import { Permission } from '../models/permissions';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.baseUrl + 
  environment.api.users.prefix + 
  environment.api.users.permissions.prefix;
  private readonly endpoints = environment.api.users.permissions.endpoints;
  permission = signal<Permission[]>([]);

  getAllPermissions(): Observable<Permission[]> {
  return this.http.get<ApiResponse<Permission[]>>(this.baseUrl + this.endpoints.getAll).pipe(
    map(res => {
      if (!res.success) {
        throw new Error(`(${res.code}) ${res.message}`);
      }
      this.permission.set(res.data);
      return res.data;
    }),
    catchError(err => {
      console.error('Error API:', err.message);
      return throwError(() => err);
    })
  );
}


  createPermission(permission: Permission): Observable<Permission> {
  return this.http.post<ApiResponse<Permission>>(this.baseUrl + this.endpoints.create, permission).pipe(
    map(res => {
      if (!res.success) {
        throw new Error(`(${res.code}) ${res.message}`);
      }

      this.permission.update(list => {
        const updated = [...list, res.data];
        return updated;
      });
      return res.data;
    }),
    catchError(err => {
      console.error('Error API:', err.message);
      return throwError(() => err);
    })
  );
}

}
