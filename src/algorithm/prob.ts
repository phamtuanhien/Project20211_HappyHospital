import exp from "constants";

/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export namespace ProbTS {
    export class Prob {
		// [0,1)
		private _rng01: () => number;

		// [-1,1]
		private _rng11: () => number;

		/**
		 * @param {() => number} rng A function generating numbers randomly within [0, 1) with a uniform distribution
		 */
		constructor(rng: () => number = Math.random) {
			this._rng01 = rng;

			this._rng11 = () => {
				// inspired by https://github.com/ckknight/random-js/blob/master/lib/random.js#L50
				return ((rng() * 0x100000000) | 0) / 0x100000000 * 2;
			};
		}

		uniform(min: number = 0, max: number = 1): UniformDistribution {
			return new UniformDistribution(this._rng01, min, max);
		}

		normal(mean: number = 0, sd: number = 1): NormalDistribution {
			return new NormalDistribution(this._rng11, mean, sd);
		}

		exponential(lambda: number = 1): ExponentialDistribution {
			return new ExponentialDistribution(this._rng01, lambda);
		}

		logNormal(mu: number = 0, sigma: number = 1): LogNormalDistribution {
			return new LogNormalDistribution(this._rng11, mu, sigma);
		}

		poisson(lambda: number = 1): PoissonDistribution {
			return new PoissonDistribution(this._rng01, lambda);
		}

        bimodal(lambda: number = 1): BimodalDistribution {
            return new BimodalDistribution(this._rng01, lambda);
        }
    }

    export enum DistributionType {
		Unknown,
		Continuous,
		Discrete
    }

    export interface Distribution {
		min: number;
		max: number;
		mean: number;
		variance: number;
		type: DistributionType;

		random(): number;
    }

    export class UniformDistribution implements Distribution {
		private _rng01: () => number;
		private _min: number;
		private _max: number;
		private _range: number;
		private _mean: number;
		private _variance: number;
		private _type: DistributionType;

		constructor(rng01: () => number, min: number, max: number) {
			this._rng01 = rng01;
			this._min = min;
			this._max = max;
			this._range = (max - min);
			this._mean = min + this._range / 2;
			this._variance = ((max - min) * (max - min)) / 12;
			this._type = DistributionType.Continuous;
		}

		get min(): number {
			return this._min;
		}

		get max(): number {
			return this._max;
		}

		get mean(): number {
			return this._mean;
		}

		get variance(): number {
			return this._variance;
		}

		get type(): DistributionType {
			return this._type;
		}

		random(): number {
			return this._min + this._rng01() * this._range;
		}
    }

    export class NormalDistribution implements Distribution {
		private _rng11: () => number;
		private _min: number;
		private _max: number;
		private _mean: number;
		private _sd: number;
		private _variance: number;
		private _type: DistributionType;
		private _y1: number | null;
		private _y2: number | null;

		constructor(rng11: () => number, mean: number, sd: number) {
			this._rng11 = rng11;
			this._min = Number.NEGATIVE_INFINITY;
			this._max = Number.POSITIVE_INFINITY;
			this._mean = mean;
			this._sd = sd;
			this._variance = sd * sd;
			this._type = DistributionType.Continuous;
			this._y1 = null;
			this._y2 = null;
		}

		get min(): number {
			return this._min;
		}

		get max(): number {
			return this._max;
		}

		get mean(): number {
			return this._mean;
		}

		get variance(): number {
			return this._variance;
		}

		get type(): DistributionType {
			return this._type;
		}

		random(): number {
            let M : number = 1/(this._sd*Math.sqrt(Math.PI*2));
            let x : number = this._rng11() - this.mean;
            let w : number = Math.exp(-x*x/(2*this._variance));
            return M*w;
		}
    }

	export class ExponentialDistribution implements Distribution {
		private _rng01: () => number;
		private _min: number;
		private _max: number;
		private _mean: number;
		private _variance: number;
		private _type: DistributionType;

		constructor(rng01: () => number, lambda: number) {
			this._rng01 = rng01;
			this._min = 0;
			this._max = Number.POSITIVE_INFINITY;
			this._mean = 1 / lambda;
			this._variance = Math.pow(lambda, -2);
			this._type = DistributionType.Continuous;
		}

		get min(): number {
			return this._min;
		}

		get max(): number {
			return this._max;
		}

		get mean(): number {
			return this._mean;
		}

		get variance(): number {
			return this._variance;
		}

		get type(): DistributionType {
			return this._type;
		}

		random(): number {
			return -1 * Math.log(this._rng01()) * this._mean;
		}
	}

    export class LogNormalDistribution implements Distribution {
		private _rng11: () => number;
		private _min: number;
		private _max: number;
		private _mean: number;
		private _variance: number;
		private _type: DistributionType;
		private _nf: NormalDistribution;

		constructor(rng11: () => number, mu: number, sigma: number) {
			this._rng11 = rng11;
			this._min = 0;
			this._max = Number.POSITIVE_INFINITY;
			this._mean = Math.exp(mu + ((sigma * sigma) / 2));
			this._variance = (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
			this._type = DistributionType.Continuous;
			this._nf = new NormalDistribution(rng11, mu, sigma);
		}

		get min(): number {
			return this._min;
		}

		get max(): number {
			return this._max;
		}

		get mean(): number {
			return this._mean;
		}

		get variance(): number {
			return this._variance;
		}

		get type(): DistributionType {
			return this._type;
		}

		random(): number {
			return Math.exp(this._nf.random());
		}
    }

    export class PoissonDistribution implements Distribution {
		private _rng01: () => number;
		private _min: number;
		private _max: number;
		private _mean: number;
		private _variance: number;
		private _type: DistributionType;
		private _L: number;

		constructor(rng01: () => number, lambda: number) {
			this._rng01 = rng01;
			this._min = 0;
			this._max = Number.POSITIVE_INFINITY;
			this._mean = lambda;
			this._variance = lambda;
			this._type = DistributionType.Discrete;
			// Knuth's algorithm
			this._L = Math.exp(-lambda);
		}

		get min(): number {
			return this._min;
		}

		get max(): number {
			return this._max;
		}

		get mean(): number {
			return this._mean;
		}

		get variance(): number {
			return this._variance;
		}

		get type(): DistributionType {
			return this._type;
		}

		random(): number {
			let k: number = 0;
			let p: number = 1;
			while (true) {
				// FIXME This should be [0,1] not [0,1)
				p = p * this._rng01();
				if (p <= this._L) {
					break;
				}
				k++;
			}
			return p;
		}
    }

    export class BimodalDistribution implements Distribution{
        private _rng01: () => number;
        private _min: number;
        private _max: number;
        private _mean: number;
        private _variance: number;
        private _type: DistributionType;
        private _p : number;
        constructor(rng01: () => number, lambda: number){
        	this._rng01 = rng01;
        	this._min = 0;
        	this._max = Number.POSITIVE_INFINITY;
        	this._mean = lambda;
        	this._variance = lambda;
        	this._type = DistributionType.Discrete;
            let abs : number = Math.abs(lambda);
            if(abs < 1 && abs != 0)
                this._p = abs;
            else
                if(abs == 0)
                    this._p = 0.6;
                else
                    this._p = 1/abs;
        }
        get min(): number {
        	return this._min;
        }
        get max(): number {
        	return this._max;
        }
        get mean(): number {
        	return this._mean;
        }
        get variance(): number {
        	return this._variance;
        }
        get type(): DistributionType {
        	return this._type;
        }
        random(): number {
            let N : number = 3628800; //n!
            let x : number = Math.floor(this._rng01()*9);
            let px : number = Math.pow(this._p, x);
            let qx : number = Math.pow(1 - this._p, 10 - x);
            let M : number = 1;
            for(let i = 1; i <= x; i++){
                M = M*i*(10 - i);
            }
        	return (N/M)*px*qx;
        }
    }
}