import { Router } from 'express';
import passport from '@middleware/passport.middleware';
import { AuthController } from '@controller/auth.controller';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.googleCallback
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  AuthController.githubCallback
);

router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  AuthController.getMe
);

router.get('/logout', AuthController.logout);

export default router;
