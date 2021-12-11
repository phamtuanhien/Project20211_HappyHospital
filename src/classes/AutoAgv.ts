import { Actor } from "./actor";
import { Graph } from "./graph";
import { Nodee } from "./node";

export class AutoAgv extends Actor {
  public toadoX: number;
  public toadoY: number;
  public graph: Graph;

  constructor(scene: Phaser.Scene, x: number, y: number, graph: Graph) {
    super(scene, x * 32, y * 32, "agv");
    (this.toadoX = x), (this.toadoY = y);
    this.graph = graph;
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
    let start = new Nodee(4, 10);
    let end = new Nodee(17, 9);
    this.calPathAStar(start, end);
  }

  public calPathDijkstra(start: Nodee, end: Nodee) {
    let queue = [];
    queue.push(this.graph.nodes[start.x][start.y]);
    while (queue.length > 0) {
      let curNode = queue.shift();
      if (curNode?.equal(end)) {
        console.log("co duong");
        break;
      } else {
        if (curNode?.nodeE != null) queue.push(curNode.nodeE);
        if (curNode?.nodeS != null) queue.push(curNode.nodeS);
        if (curNode?.nodeN != null) queue.push(curNode.nodeN);
        if (curNode?.nodeW != null) queue.push(curNode.nodeW);
      }
    }
  }

  private heuristic(node1: Nodee, node2: Nodee): number {
    return Math.abs(node1.x - node2.x) + Math.abs(node1.x - node2.x);
  }

  public calPathAStar(start: Nodee, end: Nodee): Nodee[] | null {
    let openSet: Nodee[] = [];
    let closeSet: Nodee[] = [];
    let path: Nodee[] = [];
    openSet.push(this.graph.nodes[start.x][start.y]);
    while (openSet.length > 0) {
      let winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].astar_f < openSet[winner].astar_f) {
          winner = i;
        }
      }

      let current = openSet[winner];

      if (openSet[winner].equal(end)) {
        let cur: Nodee = this.graph.nodes[end.x][end.y];
        path.push(cur);
        while (cur.previous != undefined) {
          path.push(cur.previous);
          cur = cur.previous;
        }
        path.reverse();
        console.log(path);
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
            let tempG = current.astar_g + 1;
            if (this.isInclude(neighbor, openSet)) {
              if (tempG < neighbor.astar_g) {
                neighbor.astar_g = tempG;
              }
            } else {
              neighbor.astar_g = tempG;
              openSet.push(neighbor);
            }
            neighbor.astar_h = this.heuristic(neighbor, end);
            neighbor.astar_f = neighbor.astar_h + neighbor.astar_g;
            neighbor.previous = current;
          }
        }
      }
    }
    console.log("path not found!");
    return null;
  }

  private isInclude(node: Nodee, nodes: Nodee[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (node.equal(nodes[i])) return true;
    }
    return false;
  }
}
