import { Email } from '../value-object/email';
import { Provider } from '../value-object/provider';
import { UserId } from '../value-object/userId';
import { RoleEntity } from './role.entity';

export class UserEntity {
  private id: UserId;
  private username: string;
  private email: Email;
  private password: string;
  private authorities: Set<RoleEntity>;
  private provider: Provider;
  private isVerified: boolean;
  private isAccountNonExpired: boolean;
  private isAccountNonLocked: boolean;
  private isCredentialsNonExpired: boolean;
  private isEnabled: boolean;

  constructor() {
    this.id = new UserId();
    this.authorities = new Set<RoleEntity>();
    this.provider = new Provider();
    this.isVerified = false;
    this.isAccountNonExpired = true;
    this.isAccountNonLocked = true;
    this.isCredentialsNonExpired = true;
    this.isEnabled = true;
  }

  public get getId() {
    return this.id;
  }

  public setId(id: UserId) {
    this.id = id;
  }

  public get getUsername() {
    return this.username;
  }

  public setUsername(username: string) {
    this.username = username;
  }

  public get getEmail() {
    return this.email;
  }

  public setEmail(email: Email) {
    this.email = email;
  }

  public get getPassword() {
    return this.password;
  }

  public setPassword(password: string) {
    this.password = password;
  }

  public get getAuthorities() {
    return Array.from(this.authorities);
  }

  public setAuthorities(authorities: Set<RoleEntity>) {
    this.authorities = authorities;
  }

  public get getProvider() {
    return this.provider;
  }

  public setProvider(provider: Provider) {
    this.provider = provider;
  }

  public get getIsVerified() {
    return this.isVerified;
  }

  public setIsVerified(isVerified: boolean) {
    this.isVerified = isVerified;
  }

  public get getIsAccountNonExpired() {
    return this.isAccountNonExpired;
  }

  public setIsAccountExpired() {
    this.isAccountNonExpired = false;
  }

  public get getIsAccountNonLocked() {
    return this.isAccountNonLocked;
  }

  public setIsAccountLocked() {
    this.isAccountNonLocked = false;
  }

  public get getIsCredentialsNonExpired() {
    return this.isCredentialsNonExpired;
  }

  public setIsCredentialsExpired() {
    this.isCredentialsNonExpired = false;
  }

  public get getIsEnabled() {
    return this.isEnabled;
  }

  public setIsDisabled() {
    this.isEnabled = false;
  }
}
