import fs from 'fs/promises';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  tenantId?: string | null;
  createdAt: string;
}

/** Vercel serverless mounts the project read-only; use /tmp so mock persists for that instance only. */
const dbPath =
  process.env.VERCEL === '1'
    ? path.join('/tmp', 'omkaarya-mock-users.json')
    : path.join(process.cwd(), 'data', 'users.json');

export async function ensureDb() {
  try {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    try {
      await fs.access(dbPath);
    } catch {
      const initialUsers: User[] = [
        {
          id: 'u0001',
          email: 'pepuluxhq@gmail.com',
          passwordHash: '$2b$10$P55n6r02oH6/mc3MiJpJTul9aKt/ZpC6MkinKYbdFH2/mrgGOldia',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'u0002',
          email: 'omkaaryahq@gmail.com',
          passwordHash: '$2b$10$9j76vj1dIYF/zzX5Sb/FMOfaERNVxtK70Ts4LDTB.WoqhqHvKUJaC',
          tenantId: 'f0001001-0001-4001-8001-000000000001',
          createdAt: new Date().toISOString(),
        },
      ];
      await fs.writeFile(dbPath, JSON.stringify(initialUsers, null, 2));
    }
  } catch (error) {
    console.error('Failed to initialize mock DB', error);
  }
}

export async function getUsers(): Promise<User[]> {
  await ensureDb();
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveUser(user: User): Promise<void> {
  const users = await getUsers();
  users.push(user);
  await fs.writeFile(dbPath, JSON.stringify(users, null, 2));
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email === email);
}
