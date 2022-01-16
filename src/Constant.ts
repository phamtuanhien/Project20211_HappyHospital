import { Actor } from "./classes/actor";
import { Node2D } from "./classes/node";

export enum ModeOfPathPlanning {
    FRANSEN,
    PROPOSE
}
export class Constant {
    public static get DURATION(): number { return 4; } //thời gian AutoAgv đợi để nhận/dỡ hàng khi đến đích
    public static getLateness = (x: number) => 5*x; //hàm tính chi phí thiệt hại nếu đến quá sớm hoặc quá trễ
    public static get SAFE_DISTANCE() : number { return 46; }
    public static get DELTA_T() : number { return 10; }
    public static get MODE() : ModeOfPathPlanning { return ModeOfPathPlanning.FRANSEN; }
    
    public static secondsToHMS(seconds : number) : string {
        var h = Math.floor(seconds % (3600*24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        
        var hDisplay = h >= 10 ? h : ("0" + h);
        var mDisplay = m >= 10 ? m : ("0" + m);
        var sDisplay = s >= 10 ? s : ("0" + s);
        return hDisplay + ":" + mDisplay + ":" + sDisplay;
    }

    public static validDestination(destX: number, destY: number, x: number, y: number) : boolean {
        if((destY == 14 || destY == 13) && ((destX >= 0 && destX <= 5) || (destX >= 45 && destX <= 50)))
            return false; 
        var d = Math.sqrt((destX - x)**2 + (destY - y)**2);
        if(d*32 < 10)
            return false;
        return true;
    }

    public static minDistance(actor: Actor, otherActors: Set<Actor>): number{
        let dist : number = Infinity;
        otherActors.forEach(
            (element) => {
                let smaller = Math.sqrt(((element).x - actor.x)**2 + (element.y - actor.y)**2);
                if(dist > smaller)
                    dist = smaller;
            }
        );
        return dist;
    }

    public static numberOfEdges(width: number, height: number, nodes: Node2D[][]) : number {
        let count : number = 0;
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                count += (nodes[i][j].nodeE != null) ? 1 : 0;
                count += (nodes[i][j].nodeS != null) ? 1 : 0;
                count += (nodes[i][j].nodeW != null) ? 1 : 0;
                count += (nodes[i][j].nodeN != null) ? 1 : 0;
                count += (nodes[i][j].nodeVE != null) ? 1 : 0;
                count += (nodes[i][j].nodeVS != null) ? 1 : 0;
                count += (nodes[i][j].nodeVW != null) ? 1 : 0;
                count += (nodes[i][j].nodeVN != null) ? 1 : 0;
            }
        }
        return count;
    }
}
