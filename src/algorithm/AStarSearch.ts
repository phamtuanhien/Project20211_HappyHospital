import { Position } from "../classes/position";
class Spot {
  public i: number;
  public j: number;
  public f: number;
  public g: number;
  public h: number;
  public neighbors: Spot[] = [];
  public previous?: Spot;
  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
  }

  public addNeighbors(ableSpot: Spot[]): void {
    for (let k = 0; k < ableSpot.length; k++) {
      if (this.i + 1 == ableSpot[k].i && this.j == ableSpot[k].j) {
        this.neighbors.push(ableSpot[k]);
      } else if (this.i == ableSpot[k].i && this.j + 1 == ableSpot[k].j) {
        this.neighbors.push(ableSpot[k]);
      } else if (this.i - 1 == ableSpot[k].i && this.j == ableSpot[k].j) {
        this.neighbors.push(ableSpot[k]);
      } else if (this.i == ableSpot[k].i && this.j - 1 == ableSpot[k].j) {
        this.neighbors.push(ableSpot[k]);
      }
    }
  }

  public equal(spot: Spot): boolean {
    if (this.i === spot.i && this.j === spot.j) return true;
    return false;
  }
}

export class Astar {
  public width: number;
  public height: number;
  public start: Spot;
  public end: Spot;
  public ableSpot: Spot[];
  public grid: Spot[][];
  public path: Spot[] = [];

  constructor(
    width: number,
    height: number,
    startPos: Position,
    endPos: Position,
    ablePos: Position[]
  ) {
    this.width = width;
    this.height = height;
    this.start = new Spot(startPos.x, startPos.y);
    this.end = new Spot(endPos.x, endPos.y);

    this.grid = new Array(width);
    for (let i = 0; i < width; i++) {
      this.grid[i] = [];
      for (let j = 0; j < height; j++) {
        this.grid[i][j] = new Spot(i, j);
      }
    }

    this.ableSpot = [];
    for (let i = 0; i < ablePos.length; i++) {
      this.ableSpot.push(this.grid[ablePos[i].x][ablePos[i].y]);
    }

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        this.grid[i][j].addNeighbors(this.ableSpot);
      }
    }
  }

  private heuristic(spot1: Spot, spot2: Spot): number {
    return Math.abs(spot1.i - spot2.i) + Math.abs(spot1.j - spot2.j);
  }

  private heuristic2(spot1: Spot, spot2: Spot): number {
    return Math.sqrt((spot1.i - spot2.i) ** 2 + (spot1.j - spot2.j) ** 2);
  }

  private isInclude(spot: Spot, spots: Spot[]): boolean {
    for (let i = 0; i < spots.length; i++) {
      if (spot.i === spots[i].i && spot.j === spots[i].j) return true;
    }
    return false;
  }

  public cal(): Position[] | undefined {
    let openSet: Spot[] = [];
    let closeSet: Spot[] = [];
    openSet.push(this.grid[this.start.i][this.start.j]);
    while (openSet.length > 0) {
      let winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }

      let current = openSet[winner];

      if (openSet[winner].equal(this.end)) {
        let cur: Spot = this.grid[this.end.i][this.end.j];
        this.path.push(cur);
        while (cur.previous != undefined) {
          this.path.push(cur.previous);
          cur = cur.previous;
        }
        this.path.reverse();
        let result: Position[] = [];
        for (let k = 0; k < this.path.length; k++) {
          result.push(new Position(this.path[k].i, this.path[k].j));
        }
        return result;
      }

      openSet.splice(winner, 1);
      closeSet.push(current);

      const neighbors: Spot[] = current.neighbors;

      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!this.isInclude(neighbor, closeSet)) {
          let tempG = current.g + 1;
          if (this.isInclude(neighbor, openSet)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
            }
          } else {
            neighbor.g = tempG;
            openSet.push(neighbor);
          }

          neighbor.h = this.heuristic2(neighbor, this.end);
          neighbor.f = neighbor.h + neighbor.g;
          neighbor.previous = current;
        } else {
          let tempG = current.g + 1;
          if (tempG < neighbor.g) {
            openSet.push(neighbor);
            const index = closeSet.indexOf(neighbor);
            if (index > -1) {
              closeSet.splice(index, 1);
            }
          }
        }
      }
    }
    console.log("Path not found!");
    return undefined;
  }
}
