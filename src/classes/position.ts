export class Position {
  private x: number;
  private y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public getX(): number {
    return this.x;
  }
  public getY(): number {
    return this.y;
  }
  static between(x: Position, y: Position): number {
    return Math.sqrt((x.getX() - y.getX()) ** 2 + (x.getY() - y.getY()) ** 2);
  }
}
