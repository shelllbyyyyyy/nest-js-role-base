export class RoleEntity {
  private readonly role_id: number;
  private readonly authority: string;

  constructor(id: number, authority: string) {
    this.role_id = id;
    this.authority = authority;
  }

  public get getId() {
    return this.role_id;
  }

  public get getAuthority() {
    return this.authority;
  }
}
