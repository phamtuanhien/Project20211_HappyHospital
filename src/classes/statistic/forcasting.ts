import { Constant } from "../../Constant";
import { WaitingDuration } from "./waitingPeriod";

export class Forcasting {
    public waitingAutoAgv? : Map<number, Set<WaitingDuration>>;
    private doneAutoAgv? : Set<number>;
    private doNothing : number = 0;
    public averageAverageWaitingTime : number = 0;

    constructor() {
        this.waitingAutoAgv = new Map<number, Set<WaitingDuration>>();
        this.doneAutoAgv = new Set<number>();
    }

    public rememberDoneAutoAgv(id: number) {
        if(this.doneAutoAgv == null){
            this.doneAutoAgv = new Set<number>();
        }
        if(!this.doneAutoAgv.has(id)){
            this.doneAutoAgv.add(id);
        }
    }

    public removeAutoAgv(id: number):void {
        if(this.waitingAutoAgv == null) {
            return;
        }
        if(this.waitingAutoAgv.size == 0) {
            return;
        }
        if(this.waitingAutoAgv.has(id)) {
            this.waitingAutoAgv.delete(id);
        }
    }

    public removeDuration(id: number) : void {
        if(this.waitingAutoAgv == null) {
            return;
        }
        if(this.waitingAutoAgv.has(id)) {
            let now : number = Math.floor(performance.now()/1000);
            let arr: Array<WaitingDuration> = new Array<WaitingDuration>();
            this.waitingAutoAgv.get(id)?.forEach(
                (item) => {
                    if(item.end != -1 && item.end < now - Constant.DELTA_T) {
                        // console.log("Va cham luc " + item.end + " < " + (now - Constant.DELTA_T));
                        arr.push(item);
                    }
                }
            );
            arr.forEach(
                (item) => {
                    this.waitingAutoAgv?.get(id)?.delete(item);
                }
            );
            if(this.waitingAutoAgv.get(id)?.size == 0) {
            //Nếu tất cả quá khứ của autoAgv (có định danh id) đã xoá hết
            //và nếu autoAgv này đã đến đích
                if(this.doneAutoAgv?.has(id)) {
                    //Thì xoá nó khỏi các danh sách của forcasting
                    this.waitingAutoAgv.delete(id);
                    this.doneAutoAgv.delete(id);
                }
            }
            arr = [];
        }
    }

    public addDuration(id: number, duration: WaitingDuration): void {
        if(this.waitingAutoAgv == null) {
            this.waitingAutoAgv = new Map<number, Set<WaitingDuration>>();
        }
        if(!this.waitingAutoAgv.has(id)) {
            this.waitingAutoAgv.set(id, new Set<WaitingDuration>());
        }
        let m : Set<WaitingDuration> = this.waitingAutoAgv.get(id) as Set<WaitingDuration>; //.add(duration);
        m.add(duration);
        this.waitingAutoAgv.set(id, m);
    }

    public updateDuration(id: number, begin: number, end: number) {
        if(this.waitingAutoAgv == null) {
            return;
        }
        if(this.waitingAutoAgv.has(id)) {
            this.waitingAutoAgv.get(id)?.forEach(
                (item) => {
                    if(item.begin == begin){
                        item.end = end;
                        item.duration = item.end - item.begin;
                    }
                }
            );
        }
    }

    public totalAverageWaitingTime() : number {
        let result : number = 0;
        if(this.waitingAutoAgv == null) {
            this.waitingAutoAgv = new Map<number, Set<WaitingDuration>>();
            return 0;
        }
        if(this.waitingAutoAgv.size == 0) {
            return 0;
        }
        
        let now = Math.floor(performance.now()/1000);
        this.waitingAutoAgv.forEach(
            (value: Set<WaitingDuration>, key: number) =>
                {
                    let average : number = 0;
                    let count : number = 0;
                    this.removeDuration(key);//Gỡ đi các duration quá trễ rồi
                    value.forEach(
                        (item) => {
                            count++;
                            if(item.end == -1) {
                                average += now - item.begin;
                            }
                            else{
                                average += item.duration;
                            }
                        }
                    );
                    if(count == 0) {
                        average = 0;
                    }
                    else{
                        average = average / count;
                    }
                    result += average;
                }
        );
        result = Math.floor(result*100)/100;
        return result;
    }

    public log(text: Phaser.GameObjects.Text): void {
        let total : number = this.totalAverageWaitingTime();
        let numAutoAgv : number = this.waitingAutoAgv?.size as number;
        let result : number = 0;
        if(numAutoAgv != 0) result = total/numAutoAgv;
        result = Math.floor(result*100)/100;
        text.setText("Tu giay: " + Math.floor((performance.now()/1000) - Constant.DELTA_T) 
                            + ", #AutoAgv: " + numAutoAgv + " totalTime: " +
                             total + " avg: " + result + "#Stop: " + this.waitingAutoAgv?.get(2)?.size);
    }

    public calculate(): void {
        let total : number = this.totalAverageWaitingTime();
        let numAutoAgv : number = this.waitingAutoAgv?.size as number;
        //let result : number = 0;
        if(numAutoAgv != 0) this.averageAverageWaitingTime = total/numAutoAgv;
        this.averageAverageWaitingTime = Math.floor(this.averageAverageWaitingTime*100)/100;
    }
}