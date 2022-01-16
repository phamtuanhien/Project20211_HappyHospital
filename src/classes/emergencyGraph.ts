import { Position } from "./position";
import { Graph } from "./graph";
import { Node2D, StateOfNode2D } from "./node";
import { Constant } from "../Constant";
// import { VirtualNode } from "./virtualNode";

export class EmergencyGraph extends Graph {
    public virtualNodes: Node2D[][];
    constructor(
        width: number,
        height: number,
        danhsachke: Position[][][],
        pathPos: Position[],
        //scene: MainScene
      ) {
        super(width, height, danhsachke, pathPos/*, scene*/);
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

  public updateState(): void {
    super.updateState();
    for(let j = 0; j < this.width; j++) {
      for(let k = 0; k < this.height; k++) {
        let x = this.nodes[j][k].x;
        let y = this.nodes[j][k].y;
        this.nodes[j][k].weight = 0;
        this.virtualNodes[j][k].weight = 0;
        for(let i = 0; i < this.agents.length; i++) {
          let dist = Math.sqrt((x - this.agents[i].x)**2 + (y - this.agents[i].y)**2);
          if(dist/this.agents[i].speed < Constant.DELTA_T) {
            this.nodes[j][k].weight++;
          }
        }
        if(this.getAutoAgvs() != null) {
          this.getAutoAgvs().forEach(
            (item) => {
              if (item.path) {
                for (let i = 0; i < item.path.length; i++) {
                  if (item.path[i].isVirtualNode) {
                    if (item.path[i].x == this.virtualNodes[j][k].x
                      && item.path[i].y == this.virtualNodes[j][k].y) {
                        this.virtualNodes[j][k].weight++;
                    }
                  } else {
                    if (item.path[i].equal(this.nodes[j][k])) {
                      this.nodes[j][k].weight++;
                    }
                  }
                }
              }
            }
          );
        }
      }
    }
    
    
    
  }

  public calPathAStar(start: Node2D, end: Node2D): Node2D[]|null {
    /**
       * Khoi tao cac bien trong A*
    */
    let openSet: Node2D[] = [];
    let closeSet: Node2D[] = [];
    let path: Node2D[] = [];
    let astar_f: number[][] = new Array(this.width);
    let astar_g: number[][] = new Array(this.width);
    let astar_h: number[][] = new Array(this.width);
    let previous: Node2D[][] = new Array(this.width);
    for (let i = 0; i < this.width; i++) {
      astar_f[i] = new Array(this.height);
      astar_g[i] = new Array(this.height);
      astar_h[i] = new Array(this.height);
      previous[i] = new Array(this.height);
      for (let j = 0; j < this.height; j++) {
        astar_f[i][j] = 0;
        astar_g[i][j] = 0;
        astar_h[i][j] = 0;
      }
    }
    let lengthOfPath : number = 1;
    /**
     * Thuat toan
     */
    openSet.push(this.nodes[start.x][start.y]);
    while (openSet.length > 0) {
      let winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (
          astar_f[openSet[i].x][openSet[i].y] <
          astar_f[openSet[winner].x][openSet[winner].y]
        ) {
          winner = i;
        }
      }
      let current = openSet[winner];
      if (openSet[winner].equal(end)) {
        let cur: Node2D = this.nodes[end.x][end.y];
        path.push(cur);
        while (previous[cur.x][cur.y] != undefined) {
          path.push(previous[cur.x][cur.y]);
          cur = previous[cur.x][cur.y];
        }
        path.reverse();
        //console.assert(lengthOfPath == path.length, "path has length: " + path.length + " instead of " + lengthOfPath);
        return path;
      }
      openSet.splice(winner, 1);
      closeSet.push(current);
      let neighbors = [current.nodeN, current.nodeE, current.nodeS, current.nodeW,
                       current.nodeVN, current.nodeVE, current.nodeVS, current.nodeVW ];
      
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (neighbor != null) {
          if (!this.isInclude(neighbor, closeSet)) {
            let timexoay = 0;
            if (
              previous[current.x][current.y] &&
              neighbor.x != previous[current.x][current.y].x &&
              neighbor.y != previous[current.x][current.y].y
            ) {
              timexoay = 1;
            }
            let tempG =
              astar_g[current.x][current.y] + 1 + current.getW() + timexoay;
            if (super.isInclude(neighbor, openSet)) {
              if (tempG < astar_g[neighbor.x][neighbor.y]) {
                astar_g[neighbor.x][neighbor.y] = tempG;
              }
            } else {
              astar_g[neighbor.x][neighbor.y] = tempG;
              openSet.push(neighbor);
              lengthOfPath++;
            }
            astar_h[neighbor.x][neighbor.y] = this.heuristic(neighbor, end);
            astar_f[neighbor.x][neighbor.y] =
              astar_h[neighbor.x][neighbor.y] + astar_g[neighbor.x][neighbor.y];
            previous[neighbor.x][neighbor.y] = current;
          }//end of if (!this.isInclude(neighbor, closeSet)) {
        }
      }
    }//end of while (openSet.length > 0)
    console.log("Path not found!");
    return null;
  }
}