export enum State {
  EMPTY,
  BUSY,
  NOT_ALLOW,
}
export class Nodee {
  public x: number;
  public y: number;
  public nodeW: Nodee | null = null;
  public nodeN: Nodee | null = null;
  public nodeS: Nodee | null = null;
  public nodeE: Nodee | null = null;
  public w_edge_W: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_N: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_S: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_E: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w: number = 0; // thời gian dự đoán dừng
  public u: number = 0; // thời gian dừng thực tế
  public state: State;
  public p_random: number;
  public t_random: number;

  //bien cho A*
  public astar_f = 0;
  public astar_g = 0;
  public astar_h = 0;
  public previous?: Nodee;

  constructor(
    x: number,
    y: number,
    state: State = State.NOT_ALLOW,
    p_random: number = 0.05, // 0 < p_random < 1
    t_random: number = 3 // thời gian randomBusy <= t
  ) {
    this.x = x;
    this.y = y;
    this.state = state;
    this.p_random = p_random;
    this.t_random = t_random;
    // setInterval(() => {
    //   if (this.state == State.EMPTY) {
    //     let r = Math.random();
    //     if (r < this.p_random) {
    //       this.state = State.BUSY;
    //       let r1 = Math.random() * this.t_random;
    //       setTimeout(() => {
    //         this.state = State.EMPTY;
    //       }, r1 * 1000);
    //     }
    //   }
    // }, 1000);
  }

  public setNeighbor(node: Nodee) {
    if (this.x + 1 == node.x && this.y == node.y) {
      this.nodeE = node;
      this.w_edge_E = 1;
    } else if (this.x == node.x && this.y + 1 == node.y) {
      this.nodeS = node;
      this.w_edge_S = 1;
    } else if (this.x - 1 == node.x && this.y == node.y) {
      this.nodeW = node;
      this.w_edge_W = 1;
    } else if (this.x == node.x && this.y - 1 == node.y) {
      this.nodeN = node;
      this.w_edge_N = 1;
    }
  }

  public setState(state: State) {
    this.state = state;
  }

  public equal(node: Nodee) {
    return this.x == node.x && this.y == node.y;
  }
}
