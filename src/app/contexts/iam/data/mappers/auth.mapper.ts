import { SignInResponseDto } from '../dto/auth-response.dto';
import { SignInResult } from '../../domain/ports/auth-repository';

export const AuthMapper = {
  toDomainSignIn(dto: SignInResponseDto): SignInResult {
    return {
      token: dto.token,
      role: dto.role,
    };
  },
};
