import { User } from '@model/User';
import * as bcrypt from 'bcryptjs';

export class AuthService {
  static async findByGoogleId(googleId: string): Promise<User | null> {
    return User.findOne({ where: { googleId } });
  }

  static async findByGitHubId(githubId: string): Promise<User | null> {
    return User.findOne({ where: { githubId } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  static async findById(id: string): Promise<User | null> {
    return User.findOne({ where: { id }, relations: ['wallet'] });
  }

  static async createUser(data: Partial<User>): Promise<User> {
    const user = new User();
    Object.assign(user, data);
    return user.save();
  }

  static async signup(
    name: string,
    email: string,
    password: string
  ): Promise<User> {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    return user;
  }
}
