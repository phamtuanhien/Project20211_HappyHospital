import { Tilemaps } from "phaser";
import { Actor } from "./actor";
import { Position } from "./position";
import { Text } from "./text";
import { Astar } from "../algorithm/AStarSearch";

export class Agent extends Actor {
  private startPos: Position;
  private endPos: Position;
  private groundPos: Position[];
  private path?: Position[];
  private endText: Text;
  private agentText: Text;
  private astar: Astar;
  private next: number = 1;
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
    this.endText = new Text(
      this.scene,
      endPos.x * 32,
      endPos.y * 32,
      id.toString(),
      "32px"
    );
    this.agentText = new Text(
      this.scene,
      startPos.x * 32 + 10,
      startPos.y * 32 - 16,
      id.toString()
    );
    this.astar = new Astar(52, 28, startPos, endPos, groundPos);
    this.path = this.astar.cal();
    console.log(this.path);
    // PHYSICS
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
  }

  public goToDestination() {
    if (this.next == this.path?.length) return;
    if (this.x != this.path[this.next].x * 32) {
      if (this.x < this.path[this.next].x * 32) {
        this.x += 2;
        this.agentText.x += 2;
      } else {
        this.x -= 2;
        this.agentText.x -= 2;
      }
    } else if (this.y != this.path[this.next].y * 32) {
      if (this.y < this.path[this.next].y * 32) {
        this.y += 2;
        this.agentText.y += 2;
      } else {
        this.y -= 2;
        this.agentText.y -= 2;
      }
    } else {
      this.next++;
    }
  }

  public terminate() {
    this.endText.destroy();
    this.agentText.destroy();
    this.destroy();
  }

  preUpdate(): void {
    this.goToDestination();
  }
}
