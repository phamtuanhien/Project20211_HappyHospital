import { Position } from "./position";
import { Graph } from "./graph";
import { Node2D, StateOfNode2D } from "./node";
// import { VirtualNode } from "./virtualNode";

export class EmergencyGraph extends Graph {
    public virtualNodes: Node2D[][];
    constructor(
        width: number,
        height: number,
        danhsachke: Position[][][],
        pathPos: Position[]
      ) {
        super(width, height, danhsachke, pathPos);
        this.virtualNodes = new Array(width);
        for (let i = 0; i < width; i++) {
          this.virtualNodes[i] = [];
          for (let j = 0; j < height; j++) {
            this.virtualNodes[i][j] = new Node2D(i, j, true); //new VirtualNode(i, j, true);
          }
        }
        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height; j++) {
            for (let k = 0; k < danhsachke[i][j].length; k++) {
              let nutke = danhsachke[i][j][k];
              this.nodes[i][j].setNeighbor(this.virtualNodes[nutke.x][nutke.y]);
              this.virtualNodes[i][j].setNeighbor(this.virtualNodes[nutke.x][nutke.y]);
              this.virtualNodes[i][j].setNeighbor(this.nodes[nutke.x][nutke.y]);
            }
          }
        }
        for (let p of pathPos) {
          this.virtualNodes[p.x][p.y].setState(StateOfNode2D.EMPTY);
        }
    }
}