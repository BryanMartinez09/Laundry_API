import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_fallback'),
    });
  }

  async validate(payload: any) {
    // Fetch fresh user from DB to have latest permissions/role
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      return null;
    }
    
    return {
      ...user,
      userId: user.id,
      role: user.role?.name,
      permissions: user.role?.permissions || [],
      permissions_mobile: user.role?.permissions_mobile || []
    };
  }
}
