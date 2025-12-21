import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { AppConfig } from '../../../../core/config/app-config';
import { SessionStore } from '../../../../core/state/session.store';
import { AuthRepository, SignInCommand, SignInResult, SignUpCommand } from '../../domain/ports/auth-repository';
import { SignInRequestDto } from '../dto/sign-in.dto';
import { SignUpRequestDto } from '../dto/sign-up.dto';
import { SignInResponseDto } from '../dto/auth-response.dto';
import { AuthMapper } from '../mappers/auth.mapper';

@Injectable({ providedIn: 'root' })
export class HttpAuthRepository extends AuthRepository {
  private readonly baseUrl = AppConfig.apiBaseUrl;

  constructor(private http: HttpClient, private session: SessionStore) {
    super();
  }

  signIn(cmd: SignInCommand): Observable<SignInResult> {
    const url = `${this.baseUrl}/api/v1/authentication/sign-in`;

    const body: SignInRequestDto = {
      identifier: cmd.identifier,
      password: cmd.password,
    };

    return this.http.post<SignInResponseDto>(url, body).pipe(
      map(AuthMapper.toDomainSignIn),
      tap((res) => this.session.setSession(res.token, String(res.role)))
    );
  }


  signUp(cmd: SignUpCommand): Observable<void> {
    const url = `${this.baseUrl}/api/v1/authentication/sign-up`;

    const body: SignUpRequestDto = {
      username: cmd.username,
      email: cmd.email,
      password: cmd.password,
      role: cmd.role, // 'ROLE_USER'
    };

    return this.http.post<void>(url, body);
  }

  logout(): void {
    this.session.clearSession();
  }
}
