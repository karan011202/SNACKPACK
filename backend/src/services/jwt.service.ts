import jwt, {JwtPayload, SignOptions} from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
  phone: string;
}

export class JwtService {
  private readonly secret = process.env.JWT_SECRET || 'snackpack-dev-secret-change-me';
  private readonly expiresIn = process.env.JWT_EXPIRES_IN || '12h';

  generateToken(payload: {phone: string}): string {
    const options: SignOptions = {expiresIn: this.expiresIn as SignOptions['expiresIn']};
    return jwt.sign(payload, this.secret, options);
  }

  verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, this.secret) as AuthTokenPayload;
  }
}
