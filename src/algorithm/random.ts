import {ProbTS} from "./prob";

export class RandomDistribution{
    private _name! : string;
    constructor(){
    }
    getProbability() : number{
        let Prob = new ProbTS.Prob();
        let ran = Math.random();
        switch(Math.floor(ran*4)){
            case 0:
                let poisson = Prob.poisson(); //Math.random();
                this._name = "Poisson"
                return poisson.random();
            case 1:
                let uniform = Prob.uniform(0, 1);
                this._name = "Uniform"
                return uniform.random();
            case 2:
                this._name = "Bimodal"
                let bimodal = Prob.bimodal();
                return bimodal.random();
        }
        this._name = "Normal"
        let normal = Prob.normal();
        return normal.random();
    }

    getName(): string{
        return this._name;
    }
}