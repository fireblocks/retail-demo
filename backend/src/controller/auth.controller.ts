import { Request, Response, NextFunction } from 'express';
import passport from '../middleware/passport.middleware';
import { AuthService } from '../service/auth.service';
import { issueTokens } from '../middleware/passport.middleware';
import { User } from '@model/User';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const user = await AuthService.signup(name, email, password);

      
      issueTokens(user, res);

      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: 'Bad Request' });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ error: info.message });

      
      issueTokens(user, res);

      res.json({ user });
    })(req, res, next);
  }

  static googleCallback(req: Request, res: Response) {
    const user = req.user as User;

    
    issueTokens(user, res);

    res.redirect(`${process.env.FRONTEND_BASE_URL}/auth/success`);
  }

  static githubCallback(req: Request, res: Response) {
    const user = req.user as User;

    
    issueTokens(user, res);

    res.redirect(`${process.env.FRONTEND_BASE_URL}/auth/success`);
  }

  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req.user as User).id;
      const user = await AuthService.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  static logout(req: Request, res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).send();
  }
}
