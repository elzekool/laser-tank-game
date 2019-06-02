import { Object } from './object';
import {Line} from '@laser-dac/draw';
import {degsToRad, polarToCartesianVector} from '../util/vector';
import {randomInRange, randomWithScale} from '../util/random';
import {SCREEN_BOTTOM, SCREEN_LEFT, SCREEN_RIGHT, SCREEN_TOP} from '../settings';

const SPARKLE_MIN_SIZE = 0.005;
const SPARKLE_MAX_SIZE = 0.009;
const SPARKLE_ROTATION_MIN_RAD = degsToRad(45);
const SPARKLE_ROTATION_MAX_RAD = degsToRad(120);
const ARROW_SIZE = 0.015;
const ARROW_COLOR : [ number, number, number ] = [ 1, 1, 1 ];

export class Projectile implements Object
{
    private x : number;
    private y : number;
    private visibility : boolean;
    private direction : number;

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
        this.visibility = false;
        this.direction = 0;
    }

    updateCoords(x : number, y : number) {
        this.x = x;
        this.y = y;
    }

    updateDirection(direction : number) {
        this.direction = direction;
    }

    updateVisibility(visibility : boolean) {
        this.visibility = visibility;
    }

    intersectionTestLines() {
        const directionVector = polarToCartesianVector(ARROW_SIZE, this.direction)

        return [
            {
                from : { x : this.x - SPARKLE_MAX_SIZE*0.7, y : this.y - SPARKLE_MAX_SIZE*0.7 },
                to : { x : this.x - SPARKLE_MAX_SIZE*0.7, y : this.y + SPARKLE_MAX_SIZE*0.7 }
            },
            {
                from : { x : this.x - SPARKLE_MAX_SIZE*0.7, y : this.y + SPARKLE_MAX_SIZE*0.7 },
                to : { x : this.x + SPARKLE_MAX_SIZE*0.7, y : this.y + SPARKLE_MAX_SIZE*0.7 }
            },
            {
                from : { x : this.x + SPARKLE_MAX_SIZE*0.7, y : this.y + SPARKLE_MAX_SIZE*0.7 },
                to : { x : this.x + SPARKLE_MAX_SIZE*0.7, y : this.y - SPARKLE_MAX_SIZE*0.7 }
            },
            {
                from : { x : this.x + SPARKLE_MAX_SIZE*0.7, y : this.y - SPARKLE_MAX_SIZE*0.7 },
                to : { x : this.x - SPARKLE_MAX_SIZE*0.7, y : this.y - SPARKLE_MAX_SIZE*0.7 }
            }

        ];
    }

    draw() {
        if (!this.visibility || this.x < SCREEN_LEFT || this.x > SCREEN_RIGHT || this.y < SCREEN_TOP || this.y > SCREEN_BOTTOM) {
            return [];
        }

        const lines : Line[] = [];

        const directionVector = polarToCartesianVector(ARROW_SIZE, this.direction);

        lines.push(new Line({
            from : {
                x : this.x,
                y : this.y
            },
            to : {
                x : this.x + directionVector.x,
                y : this.y + directionVector.y
            },
            blankAfter : true,
            blankBefore : true,
            color : ARROW_COLOR
        }));

        for(let theta = randomWithScale(SPARKLE_ROTATION_MIN_RAD); theta <= Math.PI*2; theta += randomInRange(SPARKLE_ROTATION_MAX_RAD, SPARKLE_ROTATION_MIN_RAD)) {
            const lineOffset = polarToCartesianVector(randomInRange(SPARKLE_MIN_SIZE, SPARKLE_MAX_SIZE), theta);
            lines.push(new Line({
                from : {
                    x : this.x,
                    y : this.y
                },
                to : {
                    x : this.x + lineOffset.x,
                    y : this.y + lineOffset.y
                },
                blankAfter : true,
                blankBefore : true,
                color : [
                    randomInRange(0.6, 1.0),
                    randomInRange(0.6, 1.0),
                    0
                ]
            }))
        }

        return lines;
    }
}