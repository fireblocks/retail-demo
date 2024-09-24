import jwt, { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import * as bcrypt from 'bcryptjs';
import { authService } from '@service';
import { User } from '@model/User';
import { google, github, jwtSecret, jwtRefreshSecret } from '../auth.config';

// JWT Strategy (for access tokens)
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: (req) => req.cookies.jwt,
      secretOrKey: jwtSecret,
    },
    async (jwtPayload, done) => {
      try {
        const user = await authService.findById(jwtPayload.id);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Issue tokens (access and refresh) when a user logs in
export function issueTokens(user: User, res: any) {
  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, jwtRefreshSecret, {
    expiresIn: '2h',
  });

  res.cookie('jwt', token, { httpOnly: true });
  res.cookie('refreshToken', refreshToken, { httpOnly: true });

  return { token, refreshToken };
}

// Google Strategy
passport.use(
  new GoogleStrategy(
    google,
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await authService.findByGoogleId(profile.id);
        if (!user) {
          user = await authService.createUser({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    github,
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await authService.findByGitHubId(profile.id);
        if (!user) {
          user = await authService.createUser({
            githubId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email: string, password: string, done) => {
      try {
        const user = await authService.findByEmail(email);
        if (!user)
          return done(null, false, { message: 'Incorrect email or password.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return done(null, false, { message: 'Incorrect email or password.' });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Refresh Token Endpoint
async function refreshToken(req, res) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as JwtPayload;

    const user = await authService.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Issue a new access token
    const newAccessToken = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: '30m',
    });

    // Optionally, issue a new refresh token
    const newRefreshToken = jwt.sign({ id: user.id }, jwtRefreshSecret, {
      expiresIn: '2h',
    });

    res.cookie('jwt', newAccessToken, { httpOnly: true });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

// Export the refresh token handler
export { refreshToken };

// Serialize user to the session
passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authService.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
