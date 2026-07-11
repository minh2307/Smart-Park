export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
}
