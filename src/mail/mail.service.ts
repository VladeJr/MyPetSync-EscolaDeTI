import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<string>('MAIL_PORT'));
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL verdadeiro apenas p 465
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.logger.log(
      `📧 Nodemailer configurado -> ${host}:${port} (usuário: ${user})`,
    );
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions: Mail.Options = {
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject,
      html,
    };

    try {
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

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    const subject = 'MyPetSync: Código de Verificação de Senha';
    const htmlContent = `
      <h1>Código de Verificação</h1>
      <p>Você solicitou a redefinição de senha. Use o código abaixo para redefini-la:</p>
      
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
        <h2 style="color: #007bff; margin: 0; font-size: 32px;">${code}</h2>
      </div>
      
      <p>Este código é válido por 1 hora. Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
    `;

    await this.sendMail(to, subject, htmlContent);
  }
}
