import { GameObjects, Scene, Tilemaps } from "phaser";
import { Agv } from "../../classes/agv";
import { Agent } from "../../classes/agent";

export class MainScene extends Scene {
  private agv!: Agv;
  private agents!: Agent[];
  private map!: Tilemaps.Tilemap;
  private tileset!: Tilemaps.Tileset;
  private groundLayer!: Tilemaps.TilemapLayer;
  private elevatorLayer!: Tilemaps.TilemapLayer;
  private roomLayer!: Tilemaps.TilemapLayer;
  private gateLayer!: Tilemaps.TilemapLayer;
  private wallLayer!: Tilemaps.TilemapLayer;
  private doorLayer!: Tilemaps.TilemapLayer;
  private pathLayer!: Tilemaps.TilemapLayer;
  private pathgroundLayer!: Tilemaps.TilemapLayer;
  private bedLayer!: Tilemaps.TilemapLayer;
  private pathTiles!: Tilemaps.Tile[];
  constructor() {
    super("main-scene");
    this.agents = new Array();
    this.pathTiles = new Array();
  }

  preload(): void {
    this.load.baseURL = "assets/";
    this.load.image({
      key: "tiles",
      url: "tilemaps/tiles/hospital.png",
    });
    this.load.tilemapTiledJSON("hospital", "tilemaps/json/hospital.json");
    this.load.image("agv", "sprites/agv.png");
    this.load.spritesheet("tiles_spr", "tilemaps/tiles/hospital.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(): void {
    this.initMap();
    this.agv = new Agv(this, 32, 32 * 14);
    this.initAgents(10, 10000);

    this.physics.add.collider(this.agv, this.wallLayer);
    this.physics.add.collider(this.agv, this.roomLayer);
    this.physics.add.collider(this.agv, this.groundLayer);
  }

  update(): void {
    this.agv.update();
  }

  private initMap(): void {
    this.map = this.make.tilemap({
      key: "hospital",
      tileHeight: 32,
      tileWidth: 32,
    });
    this.tileset = this.map.addTilesetImage("hospital", "tiles");
    this.groundLayer = this.map.createLayer("ground", this.tileset, 0, 0);
    this.pathgroundLayer = this.map.createLayer(
      "pathground",
      this.tileset,
      0,
      0
    );
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.roomLayer = this.map.createLayer("room", this.tileset, 0, 0);
    this.roomLayer.setCollisionByProperty({ collides: true });
    this.wallLayer = this.map.createLayer("wall", this.tileset, 0, 0);
    this.wallLayer.setCollisionByProperty({ collides: true });
    this.doorLayer = this.map.createLayer("door", this.tileset, 0, 0);
    this.pathLayer = this.map.createLayer("path", this.tileset, 0, 0);
    this.elevatorLayer = this.map.createLayer("elevator", this.tileset, 0, 0);
    this.gateLayer = this.map.createLayer("gate", this.tileset, 0, 0);
    this.bedLayer = this.map.createLayer("bed", this.tileset, 0, 0);
    this.physics.world.setBounds(
      0,
      0,
      this.groundLayer.width,
      this.groundLayer.height
    );
    this.pathLayer
      .getTilesWithin()
      .filter((v) => v.index != -1)
      .forEach((v) => {
        this.pathTiles.push(v);
      });
  }

  private initAgents(num: number, time: number): void {
    this.updateAgents(num);
    setInterval(() => {
      this.updateAgents(num);
    }, time);
  }
  private updateAgents(num: number): void {
    if (this.agents.length != 0) {
      for (let i = 0; i < this.agents.length; i++) {
        this.agents[i].destroy();
      }
    }
    this.agents = [];
    for (let i = 0; i < num; i++) {
      let agent: Agent;
      agent = this.createAgent();
      agent.setPushable(false);
      this.physics.add.collider(this.agv, agent, () => {});
      this.agents.push(agent);
    }
    // console.log(this.agents);
  }
  private createAgent(): Agent {
    let agent: Agent;
    let randomPathTile: Tilemaps.Tile;
    const r = Math.floor(Math.random() * this.pathTiles.length);
    randomPathTile = this.pathTiles[r];
    return new Agent(this, randomPathTile.x, randomPathTile.y);
  }
}
