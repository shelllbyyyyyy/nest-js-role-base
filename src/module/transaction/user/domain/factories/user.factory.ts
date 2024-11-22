import {
  UserResponse,
  RoleResponse,
} from '../../application/response/user.reponse';
import { RoleEntity } from '../entities/role.entity';
import { UserEntity } from '../entities/user.entity';
import { Email } from '../value-object/email';
import { Provider } from '../value-object/provider';
import { UserId } from '../value-object/userId';

export class UserFactory {
  public static toDomain(data: any): UserEntity | null {
    if (!data) return null;
    const id = new UserId(data.id);
    const email = new Email(data.email);
    const authorities = new Set<RoleEntity>();
    const provider = new Provider(data.provider);

    data.authorities.map((a: RoleResponse) =>
      authorities.add(new RoleEntity(a.role_id, a.authority)),
    );

    const user = new UserEntity();
    user.setId(id);
    user.setEmail(email);
    user.setPassword(data.password);
    user.setUsername(data.username);
    user.setAuthorities(authorities);
    user.setProvider(provider);
    user.setIsVerified(data.is_verified);

    return user;
  }

  public static toDomains(data: any[]): UserEntity[] {
    if (data.length == 0) return [];

    return data.map((d) => {
      const id = new UserId(d.id);
      const email = new Email(d.email);
      const authorities = new Set<RoleEntity>();
      const provider = new Provider(d.provider);

      d.authorities.map((a: RoleResponse) =>
        authorities.add(new RoleEntity(a.role_id, a.authority)),
      );

      const user = new UserEntity();
      user.setId(id);
      user.setEmail(email);
      user.setPassword(d.password);
      user.setUsername(d.username);
      user.setAuthorities(authorities);
      user.setProvider(provider);
      user.setIsVerified(d.is_verified);

      return user;
    });
  }

  public static toResponse(data: UserEntity): UserResponse | null {
    if (!data) return null;

    const response: UserResponse = {
      id: data.getId.getValue,
      username: data.getUsername,
      email: data.getEmail.getValue,
      password: data.getPassword,
      authorities: data.getAuthorities.map((o) => {
        return {
          role_id: o.getId,
          authority: o.getAuthority,
        };
      }),
      provider: data.getProvider.getValue,
      is_verified: data.getIsVerified,
    };

    return response;
  }

  public static toResponses(data: UserEntity[]): UserResponse[] {
    if (data.length == 0) return [];

    return data.map((d) => {
      const response: UserResponse = {
        id: d.getId.getValue,
        username: d.getUsername,
        email: d.getEmail.getValue,
        password: d.getPassword,
        authorities: d.getAuthorities.map((o) => {
          return {
            role_id: o.getId,
            authority: o.getAuthority,
          };
        }),
        provider: d.getProvider.getValue,
        is_verified: d.getIsVerified,
      };

      return response;
    });
  }
}
