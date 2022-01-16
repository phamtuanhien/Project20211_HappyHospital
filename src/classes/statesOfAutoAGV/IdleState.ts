import { Actor } from "../actor";
import { Text } from "../text";
import { Graph } from "../graph";
import { Node2D, StateOfNode2D } from "../node";
import { HybridState } from "./HybridState";
import { AutoAgv } from "../AutoAgv";
import { Constant } from "../../Constant";
import { MainScene } from "../../scenes/main";
import { RunningState } from "./RunningState";
const PriorityQueue = require("priorityqueuejs");

export class IdleState extends HybridState {
    private _start: number;
    private _calculated!: boolean;
    
    constructor(start: number) {
        super();
        this._start = start;
        this._calculated = false;
    }
    public move(agv: AutoAgv): void {
        if(performance.now() - this._start < Constant.DURATION*1000) {
            if(!this._calculated) {
                this._calculated = true;
                var finish = this._start/1000;
                var mainScene =  agv.scene as MainScene;
                var expectedTime = agv.getExpectedTime();
                if(finish >= expectedTime - Constant.DURATION
                    && finish <= expectedTime + Constant.DURATION
                ){
                    return;
                } else {
                    var diff = Math.max(expectedTime - Constant.DURATION - finish,
                                            finish - expectedTime - Constant.DURATION
                                        );
                    var lateness = Constant.getLateness(diff);
                    mainScene.harmfullness = mainScene.harmfullness + lateness; 
                }
            }
            return;
        } else {
            agv.firstText?.destroy();
            var mainScene =  agv.scene as MainScene;
            if(mainScene != null)
            agv.eraseDeadline((mainScene.timeTable as Phaser.GameObjects.Text));
            agv.hybridState = new RunningState(true);
            // console.log((agv.hybridState as RunningState)._isLastMoving);
            agv.changeTarget();
        }
    }
}
