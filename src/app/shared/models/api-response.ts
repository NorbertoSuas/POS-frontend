export interface ApiResponse<T> {
  code: number;
  success: boolean;
  data: T;
  error: string | null;
  message: string;
}
