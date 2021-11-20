import { Actor } from "./actor";

export class Agent extends Actor {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x * 32, y * 32, "tiles_spr", 17);

    // PHYSICS
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
  }

  update(): void {}
}
