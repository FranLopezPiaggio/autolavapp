import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from '../infrastructure/database.js';

interface Args {
    email: string;
    password: string;
    role: string;
    name?: string;
}

function parseArgs(argv: string[]): Args {
    const get = (flag: string) => {
        const arg = argv.find((a) => a.startsWith(`--${flag}=`));
        return arg?.split('=').slice(1).join('=');
    };
    const email = get('email');
    const password = get('password');
    const role = get('role') ?? 'ADMIN';
    if (!email || !password) {
        console.error('Usage: tsx src/scripts/create-user.ts --email=<email> --password=<pass> [--role=ADMIN|OPERATOR|CLIENT] [--name=<name>]');
        process.exit(1);
    }
    const args: Args = { email, password, role };
    const name = get('name');
    if (name) args.name = name;
    return args;
}

async function main() {
    const { email, password, role, name } = parseArgs(process.argv.slice(2));

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        console.error(`User already exists: ${email}`);
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
        `INSERT INTO users (id, email, password_hash, role, name)
         VALUES ($1, $2, $3, $4, $5)`,
        [crypto.randomUUID(), email, passwordHash, role, name ?? null]
    );
    console.log(`Created user: ${email} (${role})`);
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});