import { Actor } from "./actor";
import { Text } from "./text";
import { Graph } from "./graph";
import { Nodee, State } from "./node";
const PriorityQueue = require("priorityqueuejs");

export class AutoAgv extends Actor {
  public graph: Graph;
  public path: Nodee[] | null;
  public curNode: Nodee;
  public endNode: Nodee;
  public cur: number;
  public waitT: number;
  public sobuocdichuyen: number;
  public thoigiandichuyen: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    endX: number,
    endY: number,
    graph: Graph
  ) {
    super(scene, x * 32, y * 32, "agv");
    this.graph = graph;
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
    this.cur = 0;
    this.waitT = 0;
    this.curNode = this.graph.nodes[x][y];
    this.curNode.setState(State.BUSY);
    this.endNode = this.graph.nodes[endX][endY];
    new Text(this.scene, endX * 32, endY * 32, "DES", "16px", "#F00");
    this.path = this.calPathAStar(this.curNode, this.endNode);
    this.sobuocdichuyen = 0;
    this.thoigiandichuyen = performance.now();
    this.estimateArrivalTime(x*32, y*32, endX*32, endY*32);
  }

  protected preUpdate(time: number, delta: number): void {
    this.move();
    // console.log(this.x, this.y);
  }

  public move() {
    // nếu không có đường đi đến đích thì không làm gì
    if (!this.path) {
      return;
    }

    // nếu đã đến đích thì không làm gì
    if (this.cur == this.path.length - 1) {
      this.setVelocity(0, 0);
      return;
    }

    // nodeNext: nút tiếp theo cần đến
    let nodeNext: Nodee =
      this.graph.nodes[this.path[this.cur + 1].x][this.path[this.cur + 1].y];
    /**
     * nếu nút tiếp theo đang ở trạng thái bận
     * thì Agv chuyển sang trạng thái chờ
     */
    if (nodeNext.state == State.BUSY) {
      this.setVelocity(0, 0);
      if (this.waitT) return;
      this.waitT = performance.now();
    } else {
      /**
       * nếu Agv từ trạng thái chờ -> di chuyển
       * thì cập nhật u cho node hiện tại
       */
      if (this.waitT) {
        // console.log(performance.now() - this.waitT);
        this.curNode.setU((performance.now() - this.waitT) / 1000);
        // console.log(this.curNode);
        // console.log(this.graph);
        this.waitT = 0;
      }
      // di chuyển đến nút tiếp theo
      if (
        Math.abs(this.x - nodeNext.x * 32) > 1 ||
        Math.abs(this.y - nodeNext.y * 32) > 1
      ) {
        this.scene.physics.moveTo(this, nodeNext.x * 32, nodeNext.y * 32, 32);
      } else {
        /**
         * Khi đã đến nút tiếp theo thì cập nhật trạng thái
         * cho nút trước đó, nút hiện tại và Agv
         */
        this.curNode.setState(State.EMPTY);
        this.curNode = nodeNext;
        this.curNode.setState(State.BUSY);
        this.cur++;
        this.setX(this.curNode.x * 32);
        this.setY(this.curNode.y * 32);
        this.setVelocity(0, 0);
        this.sobuocdichuyen++;
        // console.log(this.sobuocdichuyen);

        // cap nhat lai duong di Agv moi 10 buoc di chuyen;
        // hoac sau 10s di chuyen
        if (
          this.sobuocdichuyen % 10 == 0 ||
          performance.now() - this.thoigiandichuyen > 10000
        ) {
          this.thoigiandichuyen = performance.now();
          this.cur = 0;
          this.path = this.calPathAStar(this.curNode, this.endNode);
        }
      }
    }
  }

  private heuristic(node1: Nodee, node2: Nodee): number {
    return 0;
  }

  public calPathAStar(start: Nodee, end: Nodee): Nodee[] | null {
    /**
     * Khoi tao cac bien trong A*
     */
    let openSet: Nodee[] = [];
    let closeSet: Nodee[] = [];
    let path: Nodee[] = [];
    let astar_f: number[][] = new Array(this.graph.width);
    let astar_g: number[][] = new Array(this.graph.width);
    let astar_h: number[][] = new Array(this.graph.width);
    let previous: Nodee[][] = new Array(this.graph.width);
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
        let cur: Nodee = this.graph.nodes[end.x][end.y];
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

  private isInclude(node: Nodee, nodes: Nodee[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (node.equal(nodes[i])) return true;
    }
    return false;
  }
}
