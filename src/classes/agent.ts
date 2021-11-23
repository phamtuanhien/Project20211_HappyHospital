import { Tilemaps } from "phaser";
import { Actor } from "./actor";
import { Position } from "./position";
import { Text } from "./text";

export class Agent extends Actor {
  private startPos: Position;
  private endPos: Position;
  private groundPos: Position[];
  private path: Position[];
  private endText: Text;
  private agentText: Text;
  constructor(
    scene: Phaser.Scene,
    startPos: Position,
    endPos: Position,
    groundPos: Position[],
    id: number
  ) {
    super(scene, startPos.getX() * 32, startPos.getY() * 32, "tiles_spr", 17);
    this.startPos = startPos;
    this.endPos = endPos;
    this.groundPos = groundPos;
    this.path = [];
    this.endText = new Text(
      this.scene,
      endPos.getX() * 32,
      endPos.getY() * 32,
      id.toString(),
      "32px"
    );
    this.agentText = new Text(
      this.scene,
      startPos.getX() * 32 + 10,
      startPos.getY() * 32 - 16,
      id.toString()
    );
    // PHYSICS
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
    console.log(startPos, endPos);
  }

  public findPath() {}

  update(): void {}
}
