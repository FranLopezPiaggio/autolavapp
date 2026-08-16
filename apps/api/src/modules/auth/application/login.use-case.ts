import type { User } from '../domain/user.entity.js';
import type { UserRepository } from '../domain/user.repository.js';

export class LoginUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findByCredentials(email, password);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        return user;
    }
}
