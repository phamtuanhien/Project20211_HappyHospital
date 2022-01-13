import { Position } from "./position";
import { Node2D, StateOfNode2D } from "./node";
import { Agent } from "./agent";

export class Graph {
  public nodes: Node2D[][];
  public width: number;
  public height: number;
  public agents: Agent[] = [];
  public busy: number[][] = [];
  public pathPos: Position[];

  constructor(
    width: number,
    height: number,
    danhsachke: Position[][][],
    pathPos: Position[]
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
      let xl = Math.floor(agent.x / 32);
      let xr = Math.floor((agent.x + 31) / 32);
      let yt = Math.floor(agent.y / 32);
      let yb = Math.floor((agent.y + 31) / 32);
      cur[xl][yt] = 1;
      cur[xl][yb] = 1;
      cur[xr][yt] = 1;
      cur[xr][yb] = 1;
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
}
