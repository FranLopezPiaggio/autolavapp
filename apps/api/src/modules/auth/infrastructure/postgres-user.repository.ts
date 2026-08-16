import bcrypt from 'bcryptjs';
import { pool } from '../../../infrastructure/database.js';
import type { User } from '../domain/user.entity.js';
import type { UserRepository } from '../domain/user.repository.js';

interface UserRow {
    id: string;
    email: string;
    password_hash: string;
    role: string;
    name?: string;
}

export class PostgresUserRepository implements UserRepository {
    async findByCredentials(email: string, password: string): Promise<User | null> {
        const result = await pool.query<UserRow>(
            'SELECT id, email, password_hash, role, name FROM users WHERE email = $1',
            [email]
        );

        const row = result.rows[0];
        if (!row) return null;

        const valid = await bcrypt.compare(password, row.password_hash);
        if (!valid) return null;

        const user: User = {
            id: row.id,
            email: row.email,
            role: row.role,
        };
        if (row.name) user.name = row.name;

        return user;
    }
}
