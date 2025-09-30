import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Employee } from '../models/employee';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/models/api-response';
import { RolePermissions } from '../models/RolePermissions';
import { Role } from '../models/Role';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    environment.api.baseUrl +
    environment.api.users.prefix +
    environment.api.users.roles.prefix;
  private readonly endpoints = environment.api.users.roles.endpoints;
  roles = signal<Role[]>([]);

  getAllRoles(): Observable<Role[]> {
    return this.http
      .get<ApiResponse<Role[]>>(this.baseUrl + this.endpoints.getAll)
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          this.roles.set(res.data);
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }

  createRole(role: Role): Observable<Role> {
    return this.http
      .post<ApiResponse<Role>>(this.baseUrl + this.endpoints.create, role)
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }

          this.roles.update((list) => {
            const updated = [...list, res.data];
            return updated;
          });
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }
    /**
   * Elimina un rol por su id y actualiza el signal roles
   */
  deleteRole(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<null>>(this.baseUrl + this.endpoints.delete(id))
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          this.roles.update((list) => list.filter((r) => r.id !== id));
          return true;
        }),
        catchError((err) => {
          console.error('Error deleteRole:', err.message);
          return throwError(() => err);
        })
      );
  }
  getRolePermissionsById(id: string): Observable<Role> {
    return this.http
      .get<ApiResponse<Role>>(this.baseUrl + this.endpoints.getRolePermissionsById(id))
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          return res.data;
        }),
        catchError((err) => {
          console.error('Error getRolePermissionsById:', err.message);
          return throwError(() => err);
        })
      );
  }
  assignPermissions(rolePermissions: RolePermissions): Observable<Role> {
    const role: Role = {
      id: rolePermissions.id,
      name: rolePermissions.name,
      description: rolePermissions.description,
      status: rolePermissions.status,
    };
    return this.createRole(role).pipe(
      switchMap((newRole) => {
        return this.http
          .put<ApiResponse<Role>>(
            `${this.baseUrl}${this.endpoints.assignPermissions(newRole.id)}`,
            { permissionIds: rolePermissions.permissions_id }
          )
          .pipe(
            map((res) => {
              if (!res.success) throw new Error(`(${res.code}) ${res.message}`);
              return newRole;
            }),
            catchError((err) => {
              console.error('Error API:', err.message);
              return throwError(() => err);
            })
          );
      })
    );
  }
}
