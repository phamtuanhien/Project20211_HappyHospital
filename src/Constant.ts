export class Constant {
    public static DURATION : number = 4; //thời gian AutoAgv đợi để nhận/dỡ hàng khi đến đích
    public static getLateness = (x: number) => 5*x; //hàm tính chi phí thiệt hại nếu đến quá sớm hoặc quá trễ

    public static secondsToHMS(seconds : number) : string {
        var h = Math.floor(seconds % (3600*24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        
        var hDisplay = h >= 10 ? h : ("0" + h);
        var mDisplay = m >= 10 ? m : ("0" + m);
        var sDisplay = s >= 10 ? s : ("0" + s);
        return hDisplay + ":" + mDisplay + ":" + sDisplay;
    }
}
