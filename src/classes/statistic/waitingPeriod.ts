export class WaitingDuration {
    public begin: number = -1;
    public end: number = -1;
    public duration: number = 0;

    constructor(begin: number, end : number = -1, duration : number = 0) {
        this.begin = begin;
        this.end = end;
        this.duration = duration;
    }
}