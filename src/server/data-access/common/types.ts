export type Pagination<T extends Record<string, unknown> = {}> = {
  cursor?: number;
  pageSize: number;
  filters?: Partial<T>;
};
