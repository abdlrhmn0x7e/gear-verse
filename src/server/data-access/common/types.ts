export type Pagination<
  T extends Record<string, unknown> = Record<string, unknown>,
  J extends string = string,
> = {
  cursor?: number;
  pageSize: number;
  filters?: Partial<T>;
  sortBy?: J;
};
