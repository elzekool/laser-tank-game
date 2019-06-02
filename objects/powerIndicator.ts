import { Line } from '@laser-dac/draw';
import { Object } from "./object";
import {SCREEN_BOTTOM, SCREEN_LEFT, SCREEN_RIGHT} from "../settings";

const SCREEN_HORIZONTAL_CENTER = ((SCREEN_LEFT + SCREEN_RIGHT)/2) + SCREEN_LEFT;
const INDICATOR_WIDTH = 0.4;
const POWER_INDICATOR_COLOR : [ number, number, number ] = [ 0.75, 0.22, 0.17 ];

export class PowerIndicator implements Object
{
    private power : number;
    private visible : boolean;

    constructor() {
        this.power = 0;
        this.visible = false;
    }

    updatePower(power : number) {
        this.power = power;
    }

    updateVisibility(visible : boolean) {
        this.visible = visible;
    }

    intersectionTestLines() {
        return [];
    }

    draw() {
        if (!this.visible) {
            return [];
        }

        return [
            new Line({
                from : {
                    x : SCREEN_HORIZONTAL_CENTER - (INDICATOR_WIDTH/2) - ((INDICATOR_WIDTH * this.power / 100.0) / 2),
                    y : SCREEN_BOTTOM - 0.01
                },
                to : {
                    x : SCREEN_HORIZONTAL_CENTER - (INDICATOR_WIDTH/2) + ((INDICATOR_WIDTH * this.power / 100.0) / 2),
                    y : SCREEN_BOTTOM - 0.01
                },
                blankBefore : true,
                blankAfter : true,
                color : POWER_INDICATOR_COLOR
            })
        ];
    }
}