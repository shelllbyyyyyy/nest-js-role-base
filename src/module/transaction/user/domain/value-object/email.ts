export class Email {
  constructor(private readonly value: string) {
    if (value === undefined) {
      throw new Error('Email constructor called with undefined');
    }

    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email format');
    }

    this.value = value;
  }

  public get getValue() {
    return this.value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }
}
