import { Scene, Tilemaps } from "phaser";
import { Agv } from "../../classes/agv";
import { Agent } from "../../classes/agent";
import { Position } from "../../classes/position";
import { AutoAgv } from "../../classes/AutoAgv";
import { Graph } from "../../classes/graph";
import { RandomDistribution } from "../../algorithm/random";
import { Constant } from "../../Constant";

export class MainScene extends Scene {
  private agv!: Agv;
  private autoAgv: AutoAgv | null = null;
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
  private pathPos!: Position[];
  private danhsachke: Position[][][];
  private saveButton?: Phaser.GameObjects.Text;
  private loadButton?: Phaser.GameObjects.Text;
  private mapData: any = {};
  private graph?: Graph;
  private doorPos!: Position[];
  private timeText?: Phaser.GameObjects.Text;
  private sec: number = 0;
  private timeTable?: Phaser.GameObjects.Text;
  private harmfulTable?: Phaser.GameObjects.Text;
  private _harmfullness: number = 0;
  private agents!: Agent[];
  private MAX_AGENT: number = 10;
  public mapOfExits = new Map([
    ["Gate1", [50, 13, 0]],
    ["Gate2", [50, 14, 0]],
  ]);

  constructor() {
    super("main-scene");
    this.agents = new Array();
    this.groundPos = new Array();
    this.pathPos = new Array();
    this.danhsachke = new Array(52);
    this.doorPos = new Array();
    for (let i = 0; i < this.danhsachke.length; i++) {
      this.danhsachke[i] = new Array(28);
      for (let j = 0; j < this.danhsachke[i].length; j++) {
        this.danhsachke[i][j] = [];
      }
    }
  }

  preload(): void {
    this.load.scenePlugin({
      key: "rexuiplugin",
      url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      sceneKey: "rexUI",
    });
    this.load.plugin(
      "rextexteditplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js",
      true
    );
    this.load.plugin(
      "rexinputtextplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js",
      true
    );
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
    this.load.image("instruction", "sprites/instruction.png");
    this.load.html("setNumAgentForm", "setNumAgents.html");
  }

  create(): void {
    this.initMap();
    this.taodanhsachke();
    this.graph = new Graph(52, 28, this.danhsachke, this.pathPos);

    let r = Math.floor(Math.random() * this.pathPos.length);
    this.agv = new Agv(
      this,
      1 * 32,
      14 * 32,
      this.pathPos[r].x * 32,
      this.pathPos[r].y * 32,
      this.pathLayer
    );
    this.agv.setPushable(false);

    this.createRandomAutoAgv();

    this.events.on("destroyAgent", this.destroyAgentHandler, this);

    this.createAgents(10, 1000);

    this.physics.add.collider(this.agv, this.noPathLayer);

    this.addButton();

    this.openLinkInstruction();

    setInterval(() => {
      this.sec++;
      this.timeText?.setText(Constant.secondsToHMS(this.sec));
    }, 1000);

    var setNumAgentsDOM = this.add
      .dom(1790, 220)
      .createFromCache("setNumAgentForm");
    setNumAgentsDOM.setPerspective(800);
    // setNumAgentsDOM.setPosition()
    setNumAgentsDOM.addListener("click");
    setNumAgentsDOM.on("click", function (this: any, event: any) {
      if (event.target.id === "submit") {
        let input = this.getChildByName("numOfAgents");
        let numAgent = parseInt(input.value);
        if (!isNaN(numAgent) && numAgent > 0) {
          this.scene.setMaxAgents(numAgent);
        }
      }
    });
  }

  public setMaxAgents(num: number): void {
    this.MAX_AGENT = num;
  }

  public get harmfullness(): number {
    return this._harmfullness;
  }

  public set harmfullness(value: number) {
    this._harmfullness = value;
    this.harmfulTable
      ?.setText("H.ness: " + this._harmfullness.toFixed(2))
      .setPosition(window.innerWidth - 245, 320);
  }

  createAgents(numAgentInit: number, time: number) {
    // khoi tao numAgentInit dau tien
    let randoms = [];
    while (randoms.length < numAgentInit * 2) {
      var r = Math.floor(Math.random() * this.doorPos.length);
      if (randoms.indexOf(r) === -1) randoms.push(r);
    }
    this.agents = [];
    for (let i = 0; i < numAgentInit; i++) {
      let agent = new Agent(
        this,
        this.doorPos[randoms[i]],
        this.doorPos[randoms[i + numAgentInit]],
        this.groundPos,
        Math.floor(Math.random() * 100)
      );
      agent.setPushable(false);
      this.physics.add.collider(agent, this.roomLayer);
      this.physics.add.overlap(this.agv, agent, () => {
        agent.handleOverlap();
        this.agv.handleOverlap();
      });
      this.autoAgv && this.physics.add.overlap(agent, this.autoAgv, () => {});
      this.agents.push(agent);
    }
    this.graph?.setAgents(this.agents);

    // thêm ngẫu nhiên agent vào môi trường
    setInterval(() => {
      if (this.agents.length >= this.MAX_AGENT) return;
      var rand = new RandomDistribution();
      var ran = rand.getProbability();
      if (ran > 1) console.log(rand.getName() + " " + ran);
      if (ran > 0.37) return;
      var r1 = Math.floor(Math.random() * this.doorPos.length);
      var r2 = Math.floor(Math.random() * this.doorPos.length);
      let agent = new Agent(
        this,
        this.doorPos[r1],
        this.doorPos[r2],
        this.groundPos,
        Math.floor(Math.random() * 100)
      );
      agent.setPushable(false);
      this.physics.add.collider(agent, this.roomLayer);
      this.physics.add.overlap(this.agv, agent, () => {
        agent.handleOverlap();
        this.agv.handleOverlap();
      });
      this.autoAgv && this.physics.add.overlap(agent, this.autoAgv, () => {});
      this.agents.push(agent);
      this.graph?.setAgents(this.agents);
    }, time);
  }

  private destroyAgentHandler(agent: Agent) {
    let index = 0;
    for (let i = 0; i < this.agents.length; i++) {
      if (this.agents[i].getId() == agent.getId()) index = i;
    }
    this.agents.splice(index, 1);
    this.graph?.removeAgent(agent);
  }

  addButton(): void {
    this.saveButton = this.add.text(window.innerWidth - 200, 50, "Save data", {
      backgroundColor: "#eee",
      padding: { bottom: 5, top: 5, left: 10, right: 10 },
      color: "#000",
      fontSize: "24px",
      fontStyle: "bold",
    });
    this.loadButton = this.add.text(window.innerWidth - 200, 110, "Load data", {
      backgroundColor: "#eee",
      padding: { bottom: 5, top: 5, left: 10, right: 10 },
      color: "#000",
      fontSize: "24px",
      fontStyle: "bold",
    });

    this.saveButton
      .setInteractive()
      .on("pointerdown", () => this.handleClickSaveButton());
    this.loadButton
      .setInteractive()
      .on("pointerdown", () => this.handleClickLoadButton());

    this.timeText = this.add.text(window.innerWidth - 190, 290, "00:00:00", {
      color: "#D8202A",
      fontSize: "28px",
      fontStyle: "bold",
    });

    this.timeTable = this.add.text(window.innerWidth - 1910, 870, "", {
      color: "#D8202A",
      fontSize: "28px",
      fontStyle: "bold",
    });
    this.agv.writeDeadline(this.timeTable);
    this.autoAgv?.writeDeadline(this.timeTable);

    this.harmfulTable = this.add.text(
      window.innerWidth - 200,
      320,
      "H.ness: 0",
      {
        color: "#D8202A",
        fontSize: "28px",
        fontStyle: "bold",
      }
    );
  }

  openLinkInstruction() {
    const instruction = this.add
      .image(window.innerWidth - 125, window.innerHeight - 90, "instruction")
      .setInteractive();
    instruction.on("pointerup", () => {
      window.open(
        "https://github.com/phamtuanhien/Project20211_HappyHospital#readme"
      );
    });
  }

  update(): void {
    this.graph?.updateState();
    this.agv.update();
  }

  private handleClickSaveButton() {
    alert("Đã lưu map thành công!");
    this.mapData = {};
    this.mapData.agv = this.agv;
    let saveAgents = [];
    for (let i = 0; i < this.agents.length; i++) {
      saveAgents.push({
        startPos: {
          x: this.agents[i].getStartPos().x,
          y: this.agents[i].getStartPos().y,
        },
        endPos: {
          x: this.agents[i].getEndPos().x,
          y: this.agents[i].getEndPos().y,
        },
        id: this.agents[i].getId(),
      });
    }
    this.mapData.agents = saveAgents;

    const objJSON = JSON.stringify(this.mapData);
    const text = objJSON;
    const e = document.createElement("a");
    e.setAttribute(
      "href",
      // "data:text/plain;charset=utf-8," + encodeURIComponent(text)
      "data:text/plain;charset=utf-8," + text
    );
    e.setAttribute("download", "save.json");
    e.style.display = "none";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
    // console.log(text);
  }
  private handleClickLoadButton() {
    const e = document.createElement("input");
    const reader = new FileReader();
    const openFile = (event: any) => {
      var input = event.target;
      var fileTypes = "json";
      if (input.files && input.files[0]) {
        var extension = input.files[0].name.split(".").pop().toLowerCase(),
          isSuccess = fileTypes.indexOf(extension) > -1;

        if (isSuccess) {
          reader.onload = () => {
            if (typeof reader?.result == "string") {
              this.mapData = JSON.parse(reader?.result);
              this.agv.setX(this.mapData.agv.x);
              this.agv.setY(this.mapData.agv.y);

              for (let i = 0; i < this.agents.length; i++) {
                this.agents[i].eliminate();
                this.agents[i] = new Agent(
                  this,
                  new Position(
                    this.mapData.agents[i].startPos.x,
                    this.mapData.agents[i].startPos.y
                  ),
                  new Position(
                    this.mapData.agents[i].endPos.x,
                    this.mapData.agents[i].endPos.y
                  ),
                  this.groundPos,
                  this.mapData.agents[i].id
                );
              }
              // console.log(this.mapData);
              alert("Đã tải map thành công!");
            }
          };
          reader.readAsText(input.files[0]);
        } else {
          alert("File không đúng định dạng. Vui lòng chọn file .json!");
        }
      }
    };
    e.type = "file";
    e.style.display = "none";
    e.addEventListener("change", openFile, false);
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
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

    this.pathLayer
      .getTilesWithin()
      .filter((v) => v.index != -1)
      .forEach((v) => {
        const pos: Position = new Position(v.x, v.y);
        this.pathPos.push(pos);
      });

    this.doorLayer
      .getTilesWithin()
      .filter((v) => v.index != -1)
      .forEach((v) => {
        const pos: Position = new Position(v.x, v.y);
        this.doorPos.push(pos);
      });

    this.gateLayer
      .getTilesWithin()
      .filter((v) => v.index != -1)
      .forEach((v) => {
        const pos: Position = new Position(v.x, v.y);
        this.doorPos.push(pos);
      });
  }

  private createRandomAutoAgv() {
    let r = Math.floor(Math.random() * this.pathPos.length);
    if (this.graph) {
      this.autoAgv = new AutoAgv(
        this,
        1,
        13,
        46,
        2,
        // this.pathPos[r].x,
        // this.pathPos[r].y,
        this.graph
      );
    }
  }

  private checkTilesUndirection(
    tileA: Tilemaps.Tile,
    tileB: Tilemaps.Tile
  ): boolean {
    if (tileA.x == tileB.x && tileA.y == tileB.y + 1) {
      if (tileB.properties.direction == "top" || !tileB.properties.direction) {
        return true;
      }
    }
    if (tileA.x + 1 == tileB.x && tileA.y == tileB.y) {
      if (
        tileB.properties.direction == "right" ||
        !tileB.properties.direction
      ) {
        return true;
      }
    }
    if (tileA.x == tileB.x && tileA.y + 1 == tileB.y) {
      if (
        tileB.properties.direction == "bottom" ||
        !tileB.properties.direction
      ) {
        return true;
      }
    }
    if (tileA.x == tileB.x + 1 && tileA.y == tileB.y) {
      if (tileB.properties.direction == "left" || !tileB.properties.direction) {
        return true;
      }
    }
    return false;
  }

  private checkTilesNeighbor(
    tileA: Tilemaps.Tile,
    tileB: Tilemaps.Tile
  ): boolean {
    // neu o dang xet khong co huong
    if (!tileA.properties.direction) {
      if (this.checkTilesUndirection(tileA, tileB)) return true;
    } else {
      // neu o dang xet co huong
      if (tileA.properties.direction == "top") {
        if (tileA.x == tileB.x && tileA.y == tileB.y + 1) {
          /*&& tileA.properties.direction != "bottom"*/
          return true;
        }
      }
      if (tileA.properties.direction == "right") {
        if (tileA.x + 1 == tileB.x && tileA.y == tileB.y) {
          /*&& tileA.properties.direction != "left"*/
          return true;
        }
      }
      if (tileA.properties.direction == "bottom") {
        if (tileA.x == tileB.x && tileA.y + 1 == tileB.y) {
          /*&& tileA.properties.direction != "top") {*/
          return true;
        }
      }
      if (tileA.properties.direction == "left") {
        if (tileA.x == tileB.x + 1 && tileA.y == tileB.y) {
          /*&& tileA.properties.direction != "right") {*/
          return true;
        }
      }
    }
    return false;
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
          if (this.checkTilesNeighbor(tiles[i], tiles[j])) {
            this.danhsachke[tiles[i].x][tiles[i].y].push(
              new Position(tiles[j].x, tiles[j].y)
            );
          }
        }
      }
    }
  }
}
