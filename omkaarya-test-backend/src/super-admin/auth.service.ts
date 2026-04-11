import type { AuthRepository, LoginResult } from "./auth.repository.js";

export class AuthService {
  constructor(private readonly auth: AuthRepository) {}

  async login(email: string, password: string): Promise<LoginResult> {
    return this.auth.login(email, password);
  }

  async setPermanentPassword(email: string, tempPassword: string, newPassword: string): Promise<boolean> {
    return this.auth.setPermanentPassword(email, tempPassword, newPassword);
  }
}
