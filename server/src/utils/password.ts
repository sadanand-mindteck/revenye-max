import bcrypt from 'bcryptjs';

export class PasswordHash {
  static async hash(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async compare(password: string, hashed: string) {
    return bcrypt.compare(password, hashed);
  }
}
