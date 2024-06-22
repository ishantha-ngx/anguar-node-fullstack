import nodemailer, { Transporter } from 'nodemailer';
import { promises as fs } from 'fs';
import Handlebars from 'handlebars';

export const noReplyEmail = 'noreply@ngxtechnology.com';
export const emailUrls = {
  confirmEmail: 'http://localhost:3000/api/auth/confirm-email/{{token}}', // TODO: Change URL
};
export const emailSubjects = {
  confirmEmail: 'Action Required: Confirmation of your email address',
};

export enum emailContentTemplate {
  confirmEmail = 'email-confirmation.html',
}

export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  template: emailContentTemplate;
  html?: string;
  context?: any;
}

export class EmailSender {
  private transporter: Transporter;
  private readonly templateDir: string = './server/templates/email/';
  private readonly emailService: string = process.env.EMAIL_SERVICE as string;
  private readonly emailUser: string = process.env.EMAIL_USER as string;
  private readonly emailPassword: string = process.env.EMAIL_PASS as string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: this.emailService,
      auth: {
        user: this.emailUser,
        pass: this.emailPassword,
      },
    });
  }

  //   Send email
  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (options.template) {
        const html = await this.loadHtmlTemplate(
          `${this.templateDir}${options.template}`,
          options.context
        );
        options.html = html;
      }
      await this.transporter.sendMail(options);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  //   Load html template with context data
  private async loadHtmlTemplate(path: string, context: any): Promise<string> {
    try {
      const templateSource = await fs.readFile(path, 'utf8');
      const template = Handlebars.compile(templateSource);
      return template(context);
    } catch (error) {
      console.error('Error reading HTML template:', error);
      throw error;
    }
  }
}
