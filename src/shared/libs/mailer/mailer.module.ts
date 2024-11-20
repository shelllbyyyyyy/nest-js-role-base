import { join } from 'path';
import { MailerModule as Mail } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

import { ConfigService } from '@nestjs/config';
import { EmailService } from './mailer.service';

@Global()
@Module({
  imports: [
    Mail.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          secure: true,
          auth: {
            user: config.get<string>('SMTP_USERNAME'),
            pass: config.get<string>('SMTP_PASSWORD'),
          },
        },
        template: {
          dir: join(__dirname, 'shared', 'libs', 'mailer', 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailerModule {}
