import type { AuthRepository } from "./auth.repository.js";

export class AuthService {
  constructor(private readonly auth: AuthRepository) {}

  async verifyInvitationLogin(email: string, tempPassword: string): Promise<boolean> {
    return this.auth.verifyInvitationCredentials(email, tempPassword);
  }
}
