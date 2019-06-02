import * as path from 'path';
import { Rect, Line, IldaFont, loadIldaFile } from '@laser-dac/draw';
import { Object } from './object';
import {degsToRad, polarToCartesianVector} from '../util/vector';
import * as fontMap from '../assets/fontMap.json';

const fontFile = loadIldaFile(path.resolve(__dirname, '../assets/font.ild'));

const TOURET_WIDTH = 0.015;
const TOURET_HEIGHT = 0.01;
const BODY_WIDTH = 0.03;
const BODY_HEIGHT = 0.012;
const GUN_SIZE = 0.02;

const GUN_COLOR  : [ number, number, number ] = [ 0.83, 0.33, 0 ];
const TANK_COLOR : [ number, number, number ] = [ 0.95, 0.61, 0.07 ];
//const SCORE_COLOR : [ number, number, number ] = [ 0.16, 0.50, 0.73 ];

export class Tank implements Object
{
    private x : number;
    private y : number;
    private orientation : number;
    private score : number;

    constructor(x : number, y : number, orientation : number) {
        this.x = x;
        this.y = y;
        this.orientation = orientation;
        this.score = 0;
    }

    getCoords() : { x : number, y : number} {
        return {
            x : this.x,
            y : this.y
        };
    }

    getGunPointCoords() : { x : number, y : number} {
        const gunVect = polarToCartesianVector(
            GUN_SIZE,
            degsToRad(this.orientation)
        );

        return {
            x : this.x + gunVect.x,
            y : this.y - BODY_HEIGHT - (TOURET_HEIGHT/2) + gunVect.y
        }
    }

    updateOrientation(orientation : number) {
        this.orientation = orientation;
    }

    updateScore(score : number) {
        this.score = score;
    }

    updateCoordsAndOrientation(x : number, y : number, orientation : number) {
        this.x = x;
        this.y = y;
        this.orientation = orientation;
    }

    intersectionTestLines() {
        return [
            {
                from : { x : this.x - (TOURET_WIDTH/2) - ((BODY_WIDTH-TOURET_WIDTH)/4) , y : this.y - BODY_HEIGHT - TOURET_HEIGHT }, // 1
                to : { x :  this.x - (BODY_WIDTH/2), y : this.y } // 2
            },
            {
                from : { x : this.x - (BODY_WIDTH/2), y : this.y }, // 2
                to : { x : this.x + (BODY_WIDTH/2), y : this.y } // 3
            },
            {
                from : { x : this.x + (BODY_WIDTH/2), y : this.y }, // 3
                to : { x : this.x + (TOURET_WIDTH/2) + ((BODY_WIDTH-TOURET_WIDTH)/4), y : this.y - BODY_HEIGHT - TOURET_HEIGHT } // 4
            },
            {
                from : { x : this.x + (TOURET_WIDTH/2) + ((BODY_WIDTH-TOURET_WIDTH)/4), y : this.y - BODY_HEIGHT - TOURET_HEIGHT }, // 4
                to : { x : this.x - (TOURET_WIDTH/2) - ((BODY_WIDTH-TOURET_WIDTH)/4), y : this.y - BODY_HEIGHT - TOURET_HEIGHT } // 1
            }
        ];
    }

    draw() {
        return [
            new Rect({
                x: this.x - (BODY_WIDTH/2),
                y: this.y - BODY_HEIGHT,
                width: BODY_WIDTH,
                height: BODY_HEIGHT,
                color: TANK_COLOR
            }),

            new Rect({
                x: this.x - (TOURET_WIDTH/2),
                y: this.y - TOURET_HEIGHT - BODY_HEIGHT,
                width: TOURET_WIDTH,
                height: TOURET_HEIGHT,
                color: TANK_COLOR
            }),
            new Line({
                from : {
                    x : this.x,
                    y : this.y - BODY_HEIGHT - (TOURET_HEIGHT/2)
                },
                to : this.getGunPointCoords(),
                blankBefore : true,
                blankAfter : true,
                color : GUN_COLOR
            }),
            new IldaFont({
                file: fontFile,
                mapping : fontMap,
                text : this.score.toString(),
                x : this.x - (BODY_WIDTH/2) - 0.06,
                y : this.y - 0.035,
                // TODO: Depends on https://github.com/Volst/laser-dac/pull/53
                //color : SCORE_COLOR,
                size: 0.2,
                fontWidth: 0.18
            })
        ];
    }
}