export default class RNG {
  private state: number;

  public constructor(seed: string = Date.now().toString()) {
    this.state = this.hash(seed);
  }

  public random(): number {
    this.state = this.getNextState();

    return this.getStateRatio();
  }

  private getNextState(): number {
    return (this.state * 9999) % Number.MAX_SAFE_INTEGER;
  }

  private getStateRatio(): number {
    return this.state / Number.MAX_SAFE_INTEGER;
  }

  private hash(string: string): number {
    const length = string.length;
    const codes: number[] = [];
    let sum = 0;
    let output = '';

    for (let i = 0; i < length; i++) {
      const c = string.charCodeAt(i);

      codes[i] = c;
      sum += (c + 1);
    }

    sum *= sum;

    for (let i = 0; i < length; i++) {
      const c = codes[i];

      output += (((sum % c) ^ c) % c);
    }

    return Number(output) % Number.MAX_SAFE_INTEGER;
  }
}