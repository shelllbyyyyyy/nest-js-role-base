import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '@/shared/libs/pg/database.service';

import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserFactory } from '../../../domain/factories/user.factory';
import { Provider } from '../../../domain/enum/provider';
import { Filter } from '../../../domain/services/user.service';
import { Email } from '../../../domain/value-object/email';
import { UserId } from '../../../domain/value-object/userId';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly logger = new Logger(UserRepositoryImpl.name);

  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<UserEntity[]> {
    const query = `SELECT 
                    u.id, u.username, u.email, u.password, u.provider, u.is_verified,
                    ARRAY_AGG(jsonb_build_object('role_id', r.role_id, 'authority', r.authority)) AS authorities
                   FROM 
                    users u
                   LEFT JOIN 
                    user_role_junction urj ON u.id = urj.user_id
                   LEFT JOIN 
                    roles r ON urj.role_id = r.role_id
                   GROUP BY 
                    u.id, u.username, u.email, u.password, u.provider, u.is_verified;
                   `;

    const result = await this.db.query(query);

    this.logger.log(`Rows affected: ${result.rowCount}`);

    if (result.rows.length == 0) return [];

    return UserFactory.toDomains(result.rows);
  }

  async save(data: UserEntity): Promise<UserEntity> {
    const id = data.getId.getValue;
    const username = data.getUsername;
    const email = data.getEmail.getValue;
    const password = data.getPassword;
    const provider = <Provider>data.getProvider.getValue;
    const is_verified = data.getIsVerified;
    const role_id = data.getAuthorities.map((i) => i.getId);

    const query = `WITH inserted_user AS (
                    INSERT INTO users (id, username, email, password, provider, is_verified)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id, username, email, password, provider, is_verified
                  ),
                  inserted_role AS (
                    INSERT INTO user_role_junction (user_id, role_id)
                    VALUES ((SELECT id FROM inserted_user), $7)
                    RETURNING *
                  )
                  SELECT 
                    u.*, 
                    ARRAY_AGG(jsonb_build_object('role_id', r.role_id, 'authority', r.authority)) AS authorities
                  FROM 
                    inserted_user u
                  LEFT JOIN 
                    inserted_role ir ON u.id = ir.user_id
                  LEFT JOIN 
                    roles r ON ir.role_id = r.role_id
                  GROUP BY 
                    u.id, u.username, u.email, u.password, u.provider, u.is_verified;`;

    const result = await this.db.query(query, [
      id,
      username,
      email,
      password,
      provider,
      is_verified,
      role_id[0],
    ]);

    this.logger.log(`Rows affected: ${result.rowCount}`);

    if ((result.rowCount = 0)) return null;

    return UserFactory.toDomain(result.rows[0]);
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    const query = `SELECT 
                    u.id, u.username, u.email, u.password, u.provider, u.is_verified,
                    ARRAY_AGG(jsonb_build_object('role_id', r.role_id, 'authority', r.authority)) AS authorities
                   FROM 
                    users u
                   LEFT JOIN 
                    user_role_junction urj ON u.id = urj.user_id
                   LEFT JOIN 
                    roles r ON urj.role_id = r.role_id
                   WHERE 
                    u.email = $1
                   GROUP BY 
                    u.id, u.username, u.email, u.password, u.provider, u.is_verified;
                   `;

    const result = await this.db.query(query, [email.getValue]);

    this.logger.log(`Rows affected: ${result.rowCount}`);

    if (result.rows.length == 0) return null;

    return UserFactory.toDomain(result.rows[0]);
  }

  async findById(id: UserId): Promise<UserEntity | null> {
    const query = `SELECT 
                    u.id, u.username, u.email, u.password, u.provider, u.is_verified, 
                    ARRAY_AGG(jsonb_build_object('role_id', r.role_id, 'authority', r.authority)) AS authorities
                   FROM 
                    users u
                   LEFT JOIN 
                    user_role_junction urj ON u.id = urj.user_id
                   LEFT JOIN 
                    roles r ON urj.role_id = r.role_id
                   WHERE 
                    u.id = $1
                   GROUP BY 
                    u.id, u.username, u.email, u.password, u.provider, u.is_verified;
                   `;

    const result = await this.db.query(query, [id.getValue]);

    this.logger.log(`Rows affected: ${result.rowCount}`);

    if (result.rows.length == 0) return null;

    return UserFactory.toDomain(result.rows[0]);
  }

  async delete(data: UserEntity): Promise<boolean> {
    const query = `DELETE FROM users  WHERE email = $1;`;

    const result = await this.db.query(query, [data.getEmail.getValue]);

    this.logger.log(`Rows affected: ${result.rowCount}`);
    if (result.rowCount == 0) return false;

    return true;
  }

  async update(data: UserEntity): Promise<boolean> {
    const email = data.getEmail.getValue;
    const username = data.getUsername;
    const is_verified = data.getIsVerified;
    const password = data.getPassword;
    const provider = data.getProvider;

    const query = `UPDATE users
                 SET username = $1, email = $2, password = $3, is_verified = $4, provider = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE email = $2;`;

    const result = await this.db.query(query, [
      username,
      email,
      password,
      is_verified,
      provider,
    ]);

    this.logger.log(`Rows affected: ${result.rowCount}`);
    if (result.rowCount == 0) return false;

    return true;
  }

  async changeEmail(data: UserEntity): Promise<boolean> {
    const id = data.getId.getValue;
    const email = data.getEmail.getValue;

    const query = `UPDATE users
                   SET email = $2, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $1;`;

    const result = await this.db.query(query, [id, email]);

    this.logger.log(`Rows affected: ${result.rowCount}`);
    if (result.rowCount == 0) return false;

    return true;
  }

  async changeUsername(data: UserEntity): Promise<boolean> {
    const id = data.getId.getValue;
    const username = data.getUsername;

    const query = `UPDATE users
                   SET username = $2, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $1;`;

    const result = await this.db.query(query, [id, username]);

    this.logger.log(`Rows affected: ${result.rowCount}`);
    if (result.rowCount == 0) return false;

    return true;
  }

  async changePassword(data: UserEntity): Promise<boolean> {
    const id = data.getId.getValue;
    const password = data.getPassword;

    const query = `UPDATE users
                   SET password = $2, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $1;`;

    const result = await this.db.query(query, [id, password]);

    this.logger.log(`Rows affected: ${result.rowCount}`);
    if (result.rowCount == 0) return false;

    return true;
  }

  async updateAuthorities(data: UserEntity): Promise<boolean> {
    const insertQueries = data.getAuthorities.map(
      (_, index) => `($1, $${index + 2})`,
    );

    const params = [
      data.getId.getValue,
      ...data.getAuthorities.flatMap((authority) => [authority.getId]),
    ];

    const queries = [
      {
        text: 'DELETE FROM user_role_junction WHERE user_id = $1',
        params: [data.getId.getValue],
      },
      {
        text: `INSERT INTO user_role_junction (user_id, role_id)
      VALUES ${insertQueries.join(', ')}`,
        params,
      },
    ];

    const results = await this.db.transactions(queries);

    if (results) {
      return results.every((result) => {
        this.logger.log(`Rows affected: ${result.rowCount}`);

        return result.rowCount > 0;
      });
    }

    return false;
  }

  async updateProvider(data: UserEntity): Promise<boolean> {
    const id = data.getId.getValue;
    const provider = data.getProvider;

    const query = `UPDATE users
                   SET provider = $2, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $1;`;

    const result = await this.db.query(query, [id, provider]);

    this.logger.log(`Rows affected: ${result.rowCount}`);
    if (result.rowCount == 0) return false;

    return true;
  }

  async verifyUser(data: UserEntity): Promise<boolean> {
    const id = data.getId.getValue;
    const is_verified = data.getIsVerified;

    const query = `UPDATE users
                   SET is_verified = $2, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $1;`;

    const result = await this.db.query(query, [id, is_verified]);

    this.logger.log(`Rows affected: ${result.rowCount}`);
    if (result.rowCount == 0) return false;

    return true;
  }

  async filterBy(data: Filter): Promise<UserEntity[]> {
    const baseQuery = `
        SELECT 
          u.id, u.username, u.email, u.password, u.provider, u.is_verified,
          ARRAY_AGG(jsonb_build_object('role_id', r.role_id, 'authority', r.authority)) AS authorities
        FROM users u
        LEFT JOIN user_role_junction urj ON u.id = urj.user_id
        LEFT JOIN roles r ON urj.role_id = r.role_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.id) {
      conditions.push(`u.id = $${paramIndex}`);
      params.push(data.id.getValue);
      paramIndex++;
    }

    if (data.email) {
      conditions.push(`u.email = $${paramIndex}`);
      params.push(data.email.getValue);
      paramIndex++;
    }

    if (data.username) {
      conditions.push(`u.username = $${paramIndex}`);
      params.push(data.username);
      paramIndex++;
    }

    if (data.created_at_start) {
      conditions.push(`u.created_at BETWEEN $${paramIndex} AND $${paramIndex}`);
      params.push(data.created_at_start, data.created_at_end);
      paramIndex++;
      paramIndex++;
    }

    if (data.created_at) {
      conditions.push(`u.created_at >= $${paramIndex}`);
      params.push(data.created_at);
      paramIndex++;
    }

    if (data.is_verified !== undefined) {
      conditions.push(`u.is_verified = $${paramIndex}`);
      params.push(data.is_verified);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderByClause = data.order_by ? `ORDER BY ${data.order_by}` : '';
    const limitClause = data.limit ? `LIMIT $${paramIndex}` : '';
    if (data.limit) {
      params.push(data.limit);
      paramIndex++;
    }
    const offsetClause = data.offset ? `OFFSET $${paramIndex}` : ``;
    if (data.offset) {
      params.push(String(data.offset));
    }

    const query = `
        ${baseQuery}
        ${whereClause}
        GROUP BY u.id, u.username, u.email, u.password, u.provider, u.is_verified
        ${orderByClause}
        ${limitClause}
        ${offsetClause};
    `;

    const countQuery = `
    SELECT COUNT(*) AS total
    FROM users u
    LEFT JOIN user_role_junction urj ON u.id = urj.user_id
    LEFT JOIN roles r ON urj.role_id = r.role_id
    ${whereClause};
  `;

    const result = await this.db.query(query, params);

    if (limitClause && offsetClause) {
      const countResult = await this.db.query(
        countQuery,
        params.splice(0, params.length - 2),
      );
      console.log({
        total: parseInt(countResult.rows[0].total, 10),
      });
    }

    return result.rows.map((row) => UserFactory.toDomain(row));
  }
}
