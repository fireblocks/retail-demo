import 'dotenv/config';

export const google = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback',
};

export const github = {
  clientID: process.env.GIT_CLIENT_ID,
  clientSecret: process.env.GIT_CLIENT_ID,
  callbackURL: 'http://localhost:3000/auth/github/callback',
};

export const jwtSecret = process.env.JWT_SECRET_KEY;
export const jwtRefreshSecret = process.env.JWT_REFRESH_KEY;
