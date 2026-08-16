import type { User } from './user.entity.js';

export interface UserRepository {
    findByCredentials(email: string, password: string): Promise<User | null>;
}
