import jwt from 'jsonwebtoken';
import { jwtSecret } from '../auth.config';
import { User } from '@model/User';

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
}
