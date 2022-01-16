import { Constant, ModeOfPathPlanning } from "../Constant";

export enum StateOfNode2D {
  EMPTY,
  BUSY,
  NOT_ALLOW,
}

const lambda = 0.4;
export class Node2D {
  public x: number; // 0 <= x <= 52
  public y: number; // 0 <= y <= 28
  public nodeW: Node2D | null = null;
  public nodeN: Node2D | null = null;
  public nodeS: Node2D | null = null;
  public nodeE: Node2D | null = null;
  public w_edge_W: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_N: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_S: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_E: number = Number.MAX_SAFE_INTEGER; // trong so canh
  private w: number = 0; // thời gian dự đoán dừng (ms)
  private u: number = 0; // thời gian dừng thực tế (ms)
  public state: StateOfNode2D; // trạng thái nút
  public p_random: number; // xác xuất nút chuyển sang trạng thái Busy
  public t_min: number; // thời gian tối thiểu nút ở trạng thái busy (ms)
  public t_max: number; // thời gian tối đa nút ở trạng thái busy (ms)

  public nodeVW: Node2D | null = null;
  public nodeVN: Node2D | null = null;
  public nodeVS: Node2D | null = null;
  public nodeVE: Node2D | null = null;

  public w_edge_VW: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_VN: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_VS: number = Number.MAX_SAFE_INTEGER; // trong so canh
  public w_edge_VE: number = Number.MAX_SAFE_INTEGER; // trong so canh

  public isVirtualNode: boolean = false;
  private _weight: number = 0;
  
  constructor(
    x: number,
    y: number,
    isVirtualNode: boolean = false,
    state: StateOfNode2D = StateOfNode2D.NOT_ALLOW,
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
    this.isVirtualNode = isVirtualNode;
  }

  public getW(): number {
    if(Constant.MODE == ModeOfPathPlanning.FRANSEN)
      return this.w;
    else
      return this.weight;
  }

  public get weight(): number {
    return this._weight;
  }
  public set weight(value: number) {
    this._weight = value;
  }

  public setNeighbor(node: Node2D) : void {
    if(node == null)
      return;
    if(node.isVirtualNode) {
      if (this.x + 1 == node.x && this.y == node.y) {
          this.nodeVE = node;
          this.w_edge_VE = 1;
      } else if (this.x == node.x && this.y + 1 == node.y) {
          this.nodeVS = node;
          this.w_edge_VS = 1;
      } else if (this.x - 1 == node.x && this.y == node.y) {
          this.nodeVW = node;
          this.w_edge_VW = 1;
      } else if (this.x == node.x && this.y - 1 == node.y) {
          this.nodeVN = node;
          this.w_edge_VN = 1;
      }
      return;
    }
    this.setRealNeighbor(node);
    return;        
  }

  private setRealNeighbor(node: Node2D) {
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

  public setState(state: StateOfNode2D) {
    this.state = state;
  }

  public equal(node: Node2D) {
    if(node.isVirtualNode != this.isVirtualNode)
      return false;
    return this.x == node.x && this.y == node.y;
  }

  public madeOf(node: Node2D) : boolean{
    return this.equal(node);
  }

  public setU(u: number) {
    this.u = Math.floor(u);
    this.updateW();
  }

  public updateW() {
    this.w = (1 - lambda) * this.w + lambda * this.u;
  }
}