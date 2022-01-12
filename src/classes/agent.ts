import { Tilemaps } from "phaser";
import { Actor } from "./actor";
import { Position } from "./position";
import { Text } from "./text";
import { Astar } from "../algorithm/AStarSearch";
import { Graph } from "./graph";
export class Agent extends Actor {
  private startPos: Position;
  private endPos: Position;
  private groundPos: Position[];
  private path?: Position[];
  private vertexs: Position[];
  private endText: Text;
  private agentText: Text;
  private astar: Astar;
  private next: number = 1;
  private id: number;
  public isOverlap: boolean = false;
  public speed: number = 38;

  constructor(
    scene: Phaser.Scene,
    startPos: Position,
    endPos: Position,
    groundPos: Position[],
    id: number
  ) {
    super(scene, startPos.x * 32, startPos.y * 32, "tiles_spr", 17);
    this.startPos = startPos;
    this.endPos = endPos;
    this.groundPos = groundPos;
    this.path = [];
    this.vertexs = [];
    this.id = id;
    this.speed = Math.floor(Math.random() * (this.speed - 10)) + 10;

    this.endText = new Text(
      this.scene,
      endPos.x * 32 + 6,
      endPos.y * 32,
      id.toString(),
      "28px"
    );
    this.scene.physics.add.overlap(this, this.endText, () => {
      console.log(this.endText.text);
    });
    this.agentText = new Text(
      this.scene,
      startPos.x * 32,
      startPos.y * 32 - 16,
      id.toString()
    );

    this.astar = new Astar(52, 28, startPos, endPos, groundPos);
    this.path = this.astar.cal();
    // console.log("-------------------------------------------------");
    // console.log(
    //   "[Agent] Start: (%d, %d), End: (%d, %d)",
    //   startPos.x,
    //   startPos.y,
    //   endPos.x,
    //   endPos.y
    // );
    // console.log(this.path);

    this.initVertexs();

    // PHYSICS
    this.getBody().setSize(31, 31);
    this.setOrigin(0, 0);
  }

  // public goToDestinationByPath() {
  //   if (!this.path) return;
  //   if (this.next == this.path?.length) return;
  //   if (this.x != this.path[this.next].x * 32) {
  //     if (this.x < this.path[this.next].x * 32) {
  //       this.x += 2;
  //       this.agentText.x += 2;
  //     } else {
  //       this.x -= 2;
  //       this.agentText.x -= 2;
  //     }
  //   } else if (this.y != this.path[this.next].y * 32) {
  //     if (this.y < this.path[this.next].y * 32) {
  //       this.y += 2;
  //       this.agentText.y += 2;
  //     } else {
  //       this.y -= 2;
  //       this.agentText.y -= 2;
  //     }
  //   } else {
  //     this.next++;
  //   }
  // }

  public goToDestinationByVertexs() {
    if (this.next == this.vertexs.length) {
      this.agentText.setText("DONE");
      this.agentText.setFontSize(12);
      this.agentText.setX(this.x - 1);
      this.x = this.vertexs[this.vertexs.length - 1].x * 32;
      this.y = this.vertexs[this.vertexs.length - 1].y * 32;
      this.setVelocity(0, 0);
      this.eliminate();
      return;
    }
    if (
      Math.abs(this.vertexs[this.next].x * 32 - this.x) > 1 ||
      Math.abs(this.vertexs[this.next].y * 32 - this.y) > 1
    ) {
      this.scene.physics.moveTo(
        this,
        this.vertexs[this.next].x * 32,
        this.vertexs[this.next].y * 32,
        this.speed
      );
      this.agentText.setX(this.x);
      this.agentText.setY(this.y - 16);
    } else {
      this.next++;
    }
  }

  public addRandomVertexs(start: Position, end: Position) {
    let dis = Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2);
    let num = Math.ceil((dis * 32) / 50);
    for (let i = 1; i < num; i++) {
      while (true) {
        let rV = new Position(
          ((end.x - start.x) / num) * i + start.x + (Math.random() - 0.5),
          ((end.y - start.y) / num) * i + start.y + (Math.random() - 0.5)
        );
        let _1, _2, _3, _4;
        let b_1, b_2, b_3, b_4;
        _1 = new Position(rV.x, rV.y);
        _2 = new Position(rV.x + 1, rV.y);
        _3 = new Position(rV.x + 1, rV.y + 1);
        _4 = new Position(rV.x, rV.y + 1);

        for (let j = 0; j < this.groundPos.length; j++) {
          let p = this.groundPos[j];
          if (_1.x < p.x + 1 && _1.y < p.y + 1 && _1.x >= p.x && _1.y >= p.y) {
            b_1 = true;
          }
          if (_2.x < p.x + 1 && _2.y < p.y + 1 && _2.x >= p.x && _2.y >= p.y) {
            b_2 = true;
          }
          if (_3.x < p.x + 1 && _3.y < p.y + 1 && _3.x >= p.x && _3.y >= p.y) {
            b_3 = true;
          }
          if (_4.x < p.x + 1 && _4.y < p.y + 1 && _4.x >= p.x && _4.y >= p.y) {
            b_4 = true;
          }
        }
        if (b_1 && b_2 && b_3 && b_4) {
          this.vertexs.push(rV);
          break;
        }
      }
    }
  }

  public initVertexs() {
    if (this.path) {
      this.vertexs.push(this.path[0]);
      for (let cur = 2; cur < this.path.length; cur++) {
        if (
          (this.path[cur].x == this.path[cur - 1].x &&
            this.path[cur].x == this.path[cur - 2].x) ||
          (this.path[cur].y == this.path[cur - 1].y &&
            this.path[cur].y == this.path[cur - 2].y)
        ) {
          continue;
        }

        let curV = this.vertexs[this.vertexs.length - 1];
        let nextV = this.path[cur - 1];
        this.addRandomVertexs(curV, nextV);
        this.vertexs.push(nextV);
      }
      this.addRandomVertexs(
        this.vertexs[this.vertexs.length - 1],
        this.path[this.path.length - 1]
      );
      this.vertexs.push(this.path[this.path.length - 1]);
    }
  }

  preUpdate(): void {
    this.goToDestinationByVertexs();
  }

  public getStartPos(): Position {
    return this.startPos;
  }
  public getEndPos(): Position {
    return this.endPos;
  }
  public getId(): number {
    return this.id;
  }

  public eliminate() {
    this.scene.events.emit("destroyAgent", this);
    this.endText.destroy();
    this.agentText.destroy();
    this.destroy();
  }

  public pause() {
    this.setVelocity(0, 0);
    this.setActive(false);
  }
  public restart() {
    this.setActive(true);
  }

  public handleOverlap() {
    if (this.isOverlap) return;
    this.isOverlap = true;
    setTimeout(() => {
      this.isOverlap = false;
    }, 4000);
    let r = Math.random();
    if (r < 0.5) {
      return;
    } else {
      this.setVelocity(0, 0);
      this.setActive(false);
      setTimeout(() => {
        this.setActive(true);
      }, 2000);
    }
  }
}
