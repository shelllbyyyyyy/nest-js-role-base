export type Pagination<T> = {
  data: T;
  total: number;
  limit: number;
  page: number;
  total_pages: number;
};
