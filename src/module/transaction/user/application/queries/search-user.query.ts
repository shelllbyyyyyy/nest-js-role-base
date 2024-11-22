export class SearchUserQuery {
  constructor(
    public id?: string,
    public email?: string,
    public username?: string,
    public created_at?: Date,
    public created_at_start?: Date,
    public created_at_end?: Date,
    public limit?: number,
    public page?: number,
    public order_by?: string,
    public is_verified?: boolean,
  ) {}
}
