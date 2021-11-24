export class Position {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static between(x: Position, y: Position): number {
    return Math.sqrt((x.x - y.x) ** 2 + (x.y - y.y) ** 2);
  }
}
