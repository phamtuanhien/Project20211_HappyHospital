import { Actor } from "./actor";
import { Text } from "./text";
import { Graph } from "./graph";
import { Node2D, StateOfNode2D } from "./node";
import { HybridState } from "./statesOfAutoAGV/HybridState";
import { RunningState } from "./statesOfAutoAGV/RunningState";
import { MainScene } from "../scenes";
const PriorityQueue = require("priorityqueuejs");

export class AutoAgv extends Actor {
  public graph: Graph;
  public path: Node2D[] | null;
  public curNode: Node2D;
  public endNode: Node2D;
  public cur: number;
  public waitT: number;
  public sobuocdichuyen: number;
  public thoigiandichuyen: number;
  public hybridState: HybridState | undefined;
  public endX: number;
  public endY: number;
  public firstText?: Text;

  public startX: number;
  public startY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    endX: number,
    endY: number,
    graph: Graph
  ) {
    super(scene, x * 32, y * 32, "agv");
    this.startX = x * 32;
    this.startY = y * 32;
    this.endX = endX * 32;
    this.endY = endY * 32;

    this.graph = graph;
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
    this.cur = 0;
    this.waitT = 0;
    this.curNode = this.graph.nodes[x][y];
    this.curNode.setState(StateOfNode2D.BUSY);
    this.endNode = this.graph.nodes[endX][endY];
    this.firstText = new Text(
      this.scene,
      endX * 32,
      endY * 32,
      "DES",
      "16px",
      "#F00"
    );
    this.path = this.calPathAStar(this.curNode, this.endNode);
    this.sobuocdichuyen = 0;
    this.thoigiandichuyen = performance.now();
    this.estimateArrivalTime(x * 32, y * 32, endX * 32, endY * 32);
    this.hybridState = new RunningState();
  }

  protected preUpdate(time: number, delta: number): void {
    //this.move();
    // console.log(this.x, this.y);
    this.hybridState?.move(this);
  }

  private heuristic(node1: Node2D, node2: Node2D): number {
    return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
  }

  public calPathAStar(start: Node2D, end: Node2D): Node2D[] | null {
    /**
     * Khoi tao cac bien trong A*
     */
    let openSet: Node2D[] = [];
    let closeSet: Node2D[] = [];
    let path: Node2D[] = [];
    let astar_f: number[][] = new Array(this.graph.width);
    let astar_g: number[][] = new Array(this.graph.width);
    let astar_h: number[][] = new Array(this.graph.width);
    let previous: Node2D[][] = new Array(this.graph.width);
    for (let i = 0; i < this.graph.width; i++) {
      astar_f[i] = new Array(this.graph.height);
      astar_g[i] = new Array(this.graph.height);
      astar_h[i] = new Array(this.graph.height);
      previous[i] = new Array(this.graph.height);
      for (let j = 0; j < this.graph.height; j++) {
        astar_f[i][j] = 0;
        astar_g[i][j] = 0;
        astar_h[i][j] = 0;
      }
    }
    /**
     * Thuat toan
     */
    openSet.push(this.graph.nodes[start.x][start.y]);
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
        let cur: Node2D = this.graph.nodes[end.x][end.y];
        path.push(cur);
        while (previous[cur.x][cur.y] != undefined) {
          path.push(previous[cur.x][cur.y]);
          cur = previous[cur.x][cur.y];
        }
        path.reverse();
        // console.log(path);
        return path;
      }

      openSet.splice(winner, 1);
      closeSet.push(current);

      const neighbors = [
        current.nodeN,
        current.nodeE,
        current.nodeS,
        current.nodeW,
      ];
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
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
              astar_g[current.x][current.y] + 1 + current.w + timexoay;
            if (this.isInclude(neighbor, openSet)) {
              if (tempG < astar_g[neighbor.x][neighbor.y]) {
                astar_g[neighbor.x][neighbor.y] = tempG;
              }
            } else {
              astar_g[neighbor.x][neighbor.y] = tempG;
              openSet.push(neighbor);
            }
            astar_h[neighbor.x][neighbor.y] = this.heuristic(neighbor, end);
            astar_f[neighbor.x][neighbor.y] =
              astar_h[neighbor.x][neighbor.y] + astar_g[neighbor.x][neighbor.y];
            previous[neighbor.x][neighbor.y] = current;
          }
        }
      }
    }
    console.log("Path not found!");
    return null;
  }

  private isInclude(node: Node2D, nodes: Node2D[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (node.equal(nodes[i])) return true;
    }
    return false;
  }

  public changeTarget(): void {
    var mainScene = this.scene as MainScene;
    let agvsToGate1: Array<number> = mainScene.mapOfExits.get(
      "Gate1"
    ) as Array<number>;
    let agvsToGate2: Array<number> = mainScene.mapOfExits.get(
      "Gate2"
    ) as Array<number>;
    var choosenGate = agvsToGate1[2] < agvsToGate2[2] ? "Gate1" : "Gate2";
    var newArray = mainScene.mapOfExits.get(choosenGate) as Array<number>;
    newArray[2]++;
    mainScene.mapOfExits.set(choosenGate, newArray);

    this.startX = this.endX;
    this.startY = this.endY;

    var xEnd: number = newArray[0];
    var yEnd: number = newArray[1];

    this.endX = xEnd * 32;
    this.endY = yEnd * 32;

    var finalAGVs = (mainScene.mapOfExits.get(choosenGate) as Array<number>)[2];

    this.endNode = this.graph.nodes[xEnd][yEnd];
    this.firstText = new Text(
      this.scene,
      xEnd * 32,
      yEnd * 32,
      "DES_" + finalAGVs,
      "16px",
      "#F00"
    );
    this.path = this.calPathAStar(this.curNode, this.endNode);
    this.cur = 0;
    this.sobuocdichuyen = 0;
    this.thoigiandichuyen = performance.now();
    this.estimateArrivalTime(
      32 * this.startX,
      32 * this.startY,
      this.endX * 32,
      this.endY * 32
    );
  }
}
