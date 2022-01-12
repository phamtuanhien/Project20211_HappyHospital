import { Actor } from "./classes/actor";

export class Constant {
    public static DURATION : number = 4; //thời gian AutoAgv đợi để nhận/dỡ hàng khi đến đích
    public static getLateness = (x: number) => 5*x; //hàm tính chi phí thiệt hại nếu đến quá sớm hoặc quá trễ
    public static SAFE_DISTANCE = 46;

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
}
