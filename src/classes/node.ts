export enum State {
  EMPTY,
  BUSY,
  NOT_ALLOW,
}

const lambda = 0.4;
export class Nodee {
  public x: number; // 0 <= x <= 52
  public y: number; // 0 <= y <= 28
  public nodeW: Nodee | null = null;
  public nodeN: Nodee | null = null;
  public nodeS: Nodee | null = null;
  public nodeE: Nodee | null = null;
  public w_edge_W: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_N: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_S: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_E: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w: number = 0; // thời gian dự đoán dừng (ms)
  public u: number = 0; // thời gian dừng thực tế (ms)
  public state: State; // trạng thái nút
  public p_random: number; // xác xuất nút chuyển sang trạng thái Busy
  public t_min: number; // thời gian tối thiểu nút ở trạng thái busy (ms)
  public t_max: number; // thời gian tối đa nút ở trạng thái busy (ms)

  constructor(
    x: number,
    y: number,
    state: State = State.NOT_ALLOW,
    p_random: number = 0.05,
    t_min: number = 2000,
    t_max: number = 3000
  ) {
    this.x = x;
    this.y = y;
    this.state = state;
    this.p_random = p_random;
    this.t_min = t_min;
    this.t_max = t_max;

    /**
     * ngẫu nhiên chuyển node sang trạng thái BUSY
     * trong khoảng thời gian ngẫu nhiên r1
     */
    setInterval(() => {
      if (this.state == State.EMPTY) {
        let r = Math.random();
        if (r < this.p_random) {
          let r1 = this.t_min + Math.random() * (this.t_max - this.t_min);
          this.state = State.BUSY;
          setTimeout(() => {
            this.state = State.EMPTY;
          }, r1);
        }
      }
    }, 1000);
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

  public setU(u: number) {
    this.u = u;
    this.updateW();
  }

  public updateW() {
    this.w = (1 - lambda) * this.w + lambda * this.u;
  }
}
