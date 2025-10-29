import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default class AuthService {
  // Hashes a plain text password using bcrypt with a salt factor of 10
  static async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  // Compares a plain text password with a hashed password to check for a match
  static async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  // Generates a JWT token containing the user ID, with an expiration of 7 days
  static generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  }

  // Verifies a JWT token and returns the decoded payload if valid, otherwise returns null
  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}
