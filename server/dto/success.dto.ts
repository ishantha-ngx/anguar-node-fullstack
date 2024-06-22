export class SuccessDTO {
  success: boolean;
  message?: string;
  data?: any;

  constructor(message: string, data?: any) {
    this.success = true;
    this.message = message;
    if (data) {
      this.data = data;
    }
  }
}
