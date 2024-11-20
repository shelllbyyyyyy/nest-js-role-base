import { randomUUID } from 'crypto';

export class UserId {
  private readonly value: string;
  private static readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(id?: string) {
    if (id === undefined) {
      this.value = randomUUID();
    } else {
      if (!UserId.uuidRegex.test(id)) {
        throw new Error('Invalid UUID format');
      }
      this.value = id;
    }
  }

  public get getValue() {
    return this.value;
  }
}
