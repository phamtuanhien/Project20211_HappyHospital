export class Constant {
    public static DURATION : number = 4; //thời gian AutoAgv đợi để nhận/dỡ hàng khi đến đích
    public static getLateness = (x: number) => 5*x; //hàm tính chi phí thiệt hại nếu đến quá sớm hoặc quá trễ
}