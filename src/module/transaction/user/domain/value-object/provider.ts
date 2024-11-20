import { Provider as UserProvider } from '../enum/provider';

export class Provider {
  private readonly value: string;

  constructor(provider?: string) {
    if (provider == undefined) {
      this.value = UserProvider.LOCAL;
    } else {
      this.value = provider;
    }
  }

  public get getValue() {
    return this.value;
  }
}
