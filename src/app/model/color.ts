
export class Color {
  constructor(public red: number, public green: number, public blue: number) {

  }

  private static distance(color1: Color, color2: Color) {
    function sqr(x: number) { return x * x; }
    return Math.sqrt(sqr(color1.red - color2.red)
      + sqr(color1.green - color2.green)
      + sqr(color1.blue - color2.blue));
  }

  private static toHex(value: number) {
    const hex = Math.round(255 * value).toString(16);
    if (hex.length === 1) {
      return '0' + hex;
    }
    return hex;
  }

  public isSimilarTo(other: Color) {
    return Color.distance(this, other) < 0.3;
  }

  public get html(): string {
    return '#' + Color.toHex(this.red) + Color.toHex(this.green) + Color.toHex(this.blue);
  }

}
