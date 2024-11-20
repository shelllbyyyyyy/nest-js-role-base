import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubOAuthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(readonly configService: ConfigService) {
    const baseUrl = configService.get<String>('BASE_URL');
    super({
      clientID: configService.get<String>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<String>('GITHUB_CLIENT_SECRET'),
      callbackURL: `${baseUrl}/api/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const { emails, displayName } = profile;

    return {
      email: emails[0]?.value,
      username: displayName,
      password: 'test12345678',
    };
  }
}
