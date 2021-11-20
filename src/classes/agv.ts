import { Actor } from "./actor";
import { Text } from "./text";

export class Agv extends Actor {
  private text: Text;
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "agv");
    this.text = new Text(this.scene, this.x, this.y - this.height * 0.5, "AGV");
    // KEYS
    this.keyW = this.scene.input.keyboard.addKey("W");
    this.keyA = this.scene.input.keyboard.addKey("A");
    this.keyS = this.scene.input.keyboard.addKey("S");
    this.keyD = this.scene.input.keyboard.addKey("D");

    // PHYSICS
    this.getBody().setSize(32, 32);
    this.setOrigin(0, 0);
  }

  update(): void {
    this.getBody().setVelocity(0);
    this.text.setPosition(this.x, this.y - this.height * 0.5);

    if (this.keyW?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      this.body.velocity.y = -110;
    }

    if (this.keyA?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      this.body.velocity.x = -110;
    }

    if (this.keyS?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      this.body.velocity.y = 110;
    }

    if (this.keyD?.isDown) {
      // console.log("x: ", this.x);
      // console.log("y: ", this.y);
      this.body.velocity.x = 110;
    }
  }
}
