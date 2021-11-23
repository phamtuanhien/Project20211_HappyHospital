let cols = 52;
let rows = 28;
let grid = new Array(cols);

let openSet = [];
let closeSet = [];
let start;
let end;

function removeFromArray(arr, elt) {
    for( let i = arr.length-1; i>=0;i--) {
        if(arr[i] ==elt) {
            arr.splice(i,1)
        }
    }
}

class Spot {
  public i: number;
  public j: number;
  public f: number;
  public g: number;
  public h: number;
  public neighbors = [];
  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
  }

  this.addNeighbors = function(grid) {
      // add neighbors
  }
}

function setup() {
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  openSet.push(start);

  while(openSet.length > 0) {
      let winner = 0;
      for( let i = 0; i < openSet.length; i++) {
          if (openSet[i].f < openSet[winner].f) {
              winner = i;
          }
      }

      var current = openSet[winner];

      if (openSet[winner] == end) {
        console.log("DONE!")
      }

      removeFromArray(openSet, current);
      closeSet.push(current);

      const neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];

          if (!closeSet.includes(neighbor)){
              var tempG = current.g + 1;

              if (openSet.includes(neighbor)) {
                  if (tempG <neighbor.g) {
                      neighbor.g = tempG;
                  }
              } else {
                  neighbor.g = tempG;
                  openSet.push(neighbor);
              }

              neighbor.h = heuristic(neighbor, end);
              neighbor.f = neighbor.g + neighbor.h;
          }


      }

    } else {
        console.log("no solution")
    }
}
