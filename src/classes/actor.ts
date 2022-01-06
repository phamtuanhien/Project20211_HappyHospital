import { Physics } from "phaser";
import { MainScene } from "../scenes/main";
import { Constant } from "../Constant";

export class Actor extends Physics.Arcade.Sprite {
  private static _id = 0;
  private agvID!: number;
  private expectedTime!: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.getBody().setCollideWorldBounds(true);

    if(texture == "agv") {
      Actor._id++;
      this.agvID = Actor._id;
    } else {
      this.agvID = -1;//Ám chỉ đây là agent
    }
  }

  protected getBody(): Physics.Arcade.Body {
    return this.body as Physics.Arcade.Body;
  }

  public getAgvID(): number {
    return this.agvID;
  }

  public getExpectedTime() : number {
    return this.expectedTime;
  }

  public estimateArrivalTime(startX: number, startY: number, endX: number, endY: number): void {
    this.expectedTime = Math.floor(Math.sqrt((endX - startX)**2 + (endY - startY)**2)*0.085);
  }

  public writeDeadline(table: Phaser.GameObjects.Text) : void {
    if(this.agvID != -1) {
      var space = "";
      if(table.text.length > 0)
        space = "; "
      table.text = table.text + space + "DES_" + this.agvID + ": " +
          MainScene.secondsToHMS(this.expectedTime) + " ± " + Constant.DURATION;
    }
  }
}
