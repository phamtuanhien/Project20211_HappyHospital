import { GameObjects, Scene, Tilemaps } from "phaser";
import { Agv } from "../../classes/agv";
import { Agent } from "../../classes/agent";
import { Position } from "../../classes/position";

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
  private noPathLayer!: Tilemaps.TilemapLayer;
  private bedLayer!: Tilemaps.TilemapLayer;
  private groundPos!: Position[];
  private danhsachke: Position[][][];

  constructor() {
    super("main-scene");
    this.agents = new Array();
    this.groundPos = new Array();
    this.danhsachke = new Array(52);
    for (let i = 0; i < this.danhsachke.length; i++) {
      this.danhsachke[i] = new Array(28);
      for (let j = 0; j < this.danhsachke[i].length; j++) {
        this.danhsachke[i][j] = [];
      }
    }
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

  private taodanhsachke() {
    let tiles: Tilemaps.Tile[] = [];
    this.pathLayer
      .getTilesWithin()
      .filter((v) => v.index != -1)
      .forEach((v) => {
        tiles.push(v);
      });
    for (let i = 0; i < tiles.length; i++) {
      for (let j = 0; j < tiles.length; j++) {
        if (i != j) {
          // neu o dang xet khong co huong
          if (!tiles[i].properties.direction) {
            if (tiles[i].x == tiles[j].x && tiles[i].y == tiles[j].y + 1) {
              if (
                tiles[j].properties.direction == "top" ||
                !tiles[j].properties.direction
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
            if (tiles[i].x + 1 == tiles[j].x && tiles[i].y == tiles[j].y) {
              if (
                tiles[j].properties.direction == "right" ||
                !tiles[j].properties.direction
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
            if (tiles[i].x == tiles[j].x && tiles[i].y + 1 == tiles[j].y) {
              if (
                tiles[j].properties.direction == "bottom" ||
                !tiles[j].properties.direction
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
            if (tiles[i].x == tiles[j].x + 1 && tiles[i].y == tiles[j].y) {
              if (
                tiles[j].properties.direction == "left" ||
                !tiles[j].properties.direction
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
          }
          // neu o dang xet co huong
          else {
            if (tiles[i].properties.direction == "top") {
              if (
                tiles[i].x == tiles[j].x &&
                tiles[i].y == tiles[j].y + 1 &&
                tiles[i].properties.direction != "bottom"
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
            if (tiles[i].properties.direction == "right") {
              if (
                tiles[i].x + 1 == tiles[j].x &&
                tiles[i].y == tiles[j].y &&
                tiles[i].properties.direction != "left"
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
            if (tiles[i].properties.direction == "bottom") {
              if (
                tiles[i].x == tiles[j].x &&
                tiles[i].y + 1 == tiles[j].y &&
                tiles[i].properties.direction != "top"
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
            if (tiles[i].properties.direction == "left") {
              if (
                tiles[i].x == tiles[j].x + 1 &&
                tiles[i].y == tiles[j].y &&
                tiles[i].properties.direction != "right"
              ) {
                this.danhsachke[tiles[i].x][tiles[i].y].push(
                  new Position(tiles[j].x, tiles[j].y)
                );
              }
            }
          }
        }
      }
    }
    console.log(this.danhsachke);
  }

  create(): void {
    this.initMap();
    this.taodanhsachke();
    this.agv = new Agv(this, 32, 32 * 14, this.pathLayer);
    this.agv.setPushable(false);
    this.initAgents(1, 1000000);

    this.physics.add.collider(this.agv, this.noPathLayer);
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
    this.noPathLayer = this.map.createLayer("nopath", this.tileset, 0, 0);
    this.groundLayer = this.map.createLayer("ground", this.tileset, 0, 0);
    this.roomLayer = this.map.createLayer("room", this.tileset, 0, 0);
    this.wallLayer = this.map.createLayer("wall", this.tileset, 0, 0);
    this.pathLayer = this.map.createLayer("path", this.tileset, 0, 0);
    this.doorLayer = this.map.createLayer("door", this.tileset, 0, 0);
    this.elevatorLayer = this.map.createLayer("elevator", this.tileset, 0, 0);
    this.gateLayer = this.map.createLayer("gate", this.tileset, 0, 0);
    this.bedLayer = this.map.createLayer("bed", this.tileset, 0, 0);

    this.noPathLayer.setCollisionByProperty({ collides: true });
    this.roomLayer.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(
      0,
      0,
      this.groundLayer.width,
      this.groundLayer.height
    );

    this.groundLayer
      .getTilesWithin()
      .filter((v) => v.index != -1)
      .forEach((v) => {
        const pos: Position = new Position(v.x, v.y);
        this.groundPos.push(pos);
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
        this.agents[i].terminate();
      }
    }
    let randoms = [];
    while (randoms.length < num * 2) {
      var r = Math.floor(Math.random() * this.groundPos.length);
      if (randoms.indexOf(r) === -1) randoms.push(r);
    }
    this.agents = [];
    for (let i = 0; i < num; i++) {
      let agent = new Agent(
        this,
        this.groundPos[randoms[i]],
        this.groundPos[randoms[i + num]],
        this.groundPos,
        i
      );
      agent.setPushable(false);
      this.physics.add.collider(agent, this.roomLayer);
      this.physics.add.collider(this.agv, agent, () => {});
      this.agents.push(agent);
    }
  }
}
