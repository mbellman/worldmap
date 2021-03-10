export default class RNG {
  private state: number;

  public constructor(seed: string = Date.now().toString()) {
    this.state = this.getInitialState(seed);
  }

  public random(): number {
    this.state = (this.state * 9999) % Number.MAX_SAFE_INTEGER;

    return this.state / Number.MAX_SAFE_INTEGER;
  }

  public randomInRange(low: number, high: number): number {
    return low + Math.floor(this.random() * (high - low + 1));
  }

  private getInitialState(seed: string): number {
    const length = seed.length;
    const codes: number[] = [];
    let sum = 0;
    let output = '';

    for (let i = 0; i < length; i++) {
      const c = seed.charCodeAt(i);

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