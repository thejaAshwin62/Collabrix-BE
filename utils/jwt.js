import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'please-change-me';

export function sign(payload, opts = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: opts.expiresIn ?? '2h' });
}

export function verify(token) {
  return jwt.verify(token, SECRET);
}
