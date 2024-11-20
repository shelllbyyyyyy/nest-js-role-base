import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class DynamicOAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Observable<boolean> | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const provider = request.params.provider;

    const providers = ['google', 'github', 'facebook'];
    const filter = providers.find((p) => p === provider);

    if (!provider) {
      throw new UnauthorizedException('Provider is required');
    } else if (!filter) {
      throw new BadRequestException('Unknown provider');
    }

    const guard = new (AuthGuard(provider))();

    return guard.canActivate(context);
  }
}
