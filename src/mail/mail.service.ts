/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

// add tipagem
interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const mailConfig = this.configService.get<MailConfig>('mail')!;

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.port === 465,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });

    this.logger.log(
      `Nodemailer transporter inicializado para o host: ${mailConfig.host}`,
    );
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions: Mail.Options = {
      from: this.configService.get<string>('mail.from'),
      to: to,
      subject: subject,
      html: html,
    };

    try {
      // nodemailer faz o envio
      const info: SentMessageInfo =
        await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `E-mail enviado para ${to}. MessageID: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Falha ao enviar e-mail para ${to}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const subject = 'MyPetSync: Redefinição de Senha Solicitada';
    const htmlContent = `
      <h1>Redefinição de Senha</h1>
      <p>Você solicitou a redefinição de senha. Clique no link abaixo para continuar:</p>
      <a href="${resetLink}">Redefinir Minha Senha</a>
      <p>Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
    `;

    await this.sendMail(to, subject, htmlContent);
  }
}
