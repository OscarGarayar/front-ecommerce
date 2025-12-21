import { AuthToken } from '../model/auth-token';
import { Role } from '../model/role';

export interface SignInCommand {
  identifier: string; // username o email
  password: string;
}

export interface SignInResult {
  token: AuthToken;
  role: Role;
}

export interface SignUpCommand {
  username: string;
  email: string;
  password: string;
  role: string; // 'ROLE_USER'
}

export abstract class AuthRepository {
  abstract signIn(cmd: SignInCommand): import('rxjs').Observable<SignInResult>;
  abstract signUp(cmd: SignUpCommand): import('rxjs').Observable<void>;
  abstract logout(): void;
}
