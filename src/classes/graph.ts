import { Position } from "./position";
import { Node2D, StateOfNode2D } from "./node";
import { Agent } from "./agent";
import { MainScene } from "../scenes";
import { AutoAgv } from "./AutoAgv";
import { Agv } from "./agv";

export class Graph {
  public nodes: Node2D[][];
  public width: number;
  public height: number;
  public agents: Agent[] = [];
  public busy: number[][] = [];
  public pathPos: Position[];
  private autoAgvs!: Set<AutoAgv>;
  private agv!: Agv;

  constructor(
    width: number,
    height: number,
    danhsachke: Position[][][],
    pathPos: Position[],
    //scene: MainScene
  ) {
    this.width = width;
    this.height = height;
    this.nodes = new Array(width);
    this.pathPos = pathPos;
    for (let i = 0; i < width; i++) {
      this.nodes[i] = [];
      for (let j = 0; j < height; j++) {
        this.nodes[i][j] = new Node2D(i, j);
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
      this.nodes[p.x][p.y].setState(StateOfNode2D.EMPTY);
    }
    // console.log(this.nodes);

    this.busy = new Array(52);
    for (let i = 0; i < 52; i++) {
      this.busy[i] = new Array(28);
      for (let j = 0; j < 28; j++) {
        if (this.nodes[i][j].state === StateOfNode2D.EMPTY) {
          this.busy[i][j] = 0;
        } else {
          this.busy[i][j] = 2;
        }
      }
    }
  }

  public setAutoAgvs(agvs: Set<AutoAgv>) {
    this.autoAgvs = agvs;
  }

  public getAutoAgvs(): Set<AutoAgv> {
    return this.autoAgvs;
  }

  public setMAgv(agv: Agv) {
    this.agv = agv;
  }

  public setAgents(agents: Agent[]): void {
    for (let p of this.pathPos) {
      this.nodes[p.x][p.y].setState(StateOfNode2D.EMPTY);
    }
    this.busy = new Array(52);
    for (let i = 0; i < 52; i++) {
      this.busy[i] = new Array(28);
      for (let j = 0; j < 28; j++) {
        if (this.nodes[i][j].state == StateOfNode2D.EMPTY) {
          this.busy[i][j] = 0;
        } else {
          this.busy[i][j] = 2;
        }
      }
    }
    this.agents = agents;
  }

  public updateState(): void {
    let cur = new Array(52);
    for (let i = 0; i < 52; i++) {
      cur[i] = new Array(28);
      for (let j = 0; j < 28; j++) {
        cur[i][j] = 0;
      }
    }
    for (let i = 0; i < this.agents.length; i++) {
      let agent = this.agents[i];
      if (agent.active) {
        let xl = Math.floor(agent.x / 32);
        let xr = Math.floor((agent.x + 31) / 32);
        let yt = Math.floor(agent.y / 32);
        let yb = Math.floor((agent.y + 31) / 32);
        cur[xl][yt] = 1;
        cur[xl][yb] = 1;
        cur[xr][yt] = 1;
        cur[xr][yb] = 1;
      }
    }
    for (let i = 0; i < 52; i++) {
      for (let j = 0; j < 28; j++) {
        if (this.busy[i][j] === 2) {
          continue;
        } else if (this.busy[i][j] === 0) {
          if ((cur[i][j] === 0)) continue;
          this.nodes[i][j].setState(StateOfNode2D.BUSY);
          this.busy[i][j] = 1;
        } else {
          if (cur[i][j] === 1) continue;
          this.nodes[i][j].setState(StateOfNode2D.EMPTY);
          this.busy[i][j] = 0;
        }
      }
    }
  }

  public removeAgent(agent: Agent): void {
    let i = agent.x / 32;
    let j = agent.y / 32;
    this.nodes[i][j].setState(StateOfNode2D.EMPTY);
    this.busy[i][j] = 0;
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

          if (!this.isInclude(neighbor, closeSet)) {
            if (this.isInclude(neighbor, openSet)) {
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
          } else {
            if (tempG < astar_g[neighbor.x][neighbor.y]) {
              openSet.push(neighbor);
              const index = closeSet.indexOf(neighbor);
              if (index > -1) {
                closeSet.splice(index, 1);
              }
            }
          }
        }
      }
    }//end of while (openSet.length > 0)
    console.log("Path not found!");
    return null;
  }

  public isInclude(node: Node2D, nodes: Node2D[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (node.equal(nodes[i])) return true;
    }
    return false;
  }

  public heuristic(node1: Node2D, node2: Node2D): number {
    return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
  }
}
