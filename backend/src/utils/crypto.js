import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const generateJWT = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const verifyJWT = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateRecoveryCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REC_';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '_';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const validateNickname = (nickname) => {
  if (!nickname) return false;
  if (nickname.length < 3 || nickname.length > 24) return false;
  return /^[A-Za-z0-9_.]+$/.test(nickname);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};