import { Position } from "./position";
import { Nodee, State } from "./node";

export class Graph {
  public nodes: Nodee[][];
  public width: number;
  public height: number;

  constructor(
    width: number,
    height: number,
    danhsachke: Position[][][],
    pathPos: Position[]
  ) {
    this.width = width;
    this.height = height;
    this.nodes = new Array(width);
    for (let i = 0; i < width; i++) {
      this.nodes[i] = [];
      for (let j = 0; j < height; j++) {
        this.nodes[i][j] = new Nodee(i, j);
      }
    }
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        for (let k = 0; k < danhsachke[i][j].length; k++) {
          let nutke = danhsachke[i][j][k];
          this.nodes[i][j].setNeighbor(this.nodes[nutke.x][nutke.y]);
        }
      }
    }
    for (let p of pathPos) {
      this.nodes[p.x][p.y].setState(State.EMPTY);
    }
    console.log(this.nodes);
  }
}
