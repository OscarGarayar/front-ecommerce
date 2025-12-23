// src/app/contexts/catalog/data/dto/page.dto.ts

export interface PageDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
