import {IntersectionLine, Object} from './object';
import {Tank} from './tank';
import {Path} from '@laser-dac/draw';
import {randomInRange, randomWithScale} from '../util/random';
import {cartesianToPolarVector, polarToCartesianVector} from '../util/vector';
import {SCREEN_BOTTOM, SCREEN_LEFT, SCREEN_PLAYFIELD_TOP, SCREEN_RIGHT} from '../settings';

const GROUND_COLOR : [ number, number, number ] = [ 0, 0.5, 0 ];
const GROUND_MIN = SCREEN_PLAYFIELD_TOP;
const GROUND_MAX = SCREEN_BOTTOM - 0.05;
const TANK_PLATFORM_WIDTH = 0.06;
const MIN_SPLITS = 10;
const MAX_SPLITS = 25;

interface GroundPointCoord {
    x: number;
    y: number;
}

interface GroundLine {
    from : GroundPointCoord,
    to : GroundPointCoord,
    unbreakable : boolean
}

export class Ground implements Object
{
    private groundLines : GroundLine[];
    private tank1 : Tank;
    private tank2 : Tank;

    constructor(tank1 : Tank, tank2 : Tank) {
        this.groundLines = [];
        this.tank1 = tank1;
        this.tank2 = tank2;
        this.regenerate();
    }

    regenerate() {
        this.groundLines = [];
        const tank1 = this.tank1;
        const tank2 = this.tank2;

        // First add line from left to first tank platform
        this.groundLines.push({
            from : { x : SCREEN_LEFT, y : randomInRange(GROUND_MAX, GROUND_MIN) },
            to : { x : tank1.getCoords().x - (TANK_PLATFORM_WIDTH/2), y : tank1.getCoords().y + 0.001 },
            unbreakable : false
        });

        // Add tank1 platform
        this.groundLines.push({
            from : { x : tank1.getCoords().x - (TANK_PLATFORM_WIDTH/2), y : tank1.getCoords().y + 0.001 },
            to : { x : tank1.getCoords().x + (TANK_PLATFORM_WIDTH/2), y : tank1.getCoords().y + 0.001 },
            unbreakable : true
        });

        // Add line between tanks
        this.groundLines.push({
            from : { x : tank1.getCoords().x + (TANK_PLATFORM_WIDTH/2), y : tank1.getCoords().y + 0.001 },
            to : { x : tank2.getCoords().x - (TANK_PLATFORM_WIDTH/2), y : tank2.getCoords().y + 0.001 },
            unbreakable : false
        });

        // Add tank 2 platform
        this.groundLines.push({
            from : { x : tank2.getCoords().x - (TANK_PLATFORM_WIDTH/2), y : tank2.getCoords().y + 0.001 },
            to : { x : tank2.getCoords().x + (TANK_PLATFORM_WIDTH/2),  y : tank2.getCoords().y + 0.001 },
            unbreakable : true
        });

        // Last add line from second tank platform to right
        this.groundLines.push({
            from : { x : tank2.getCoords().x + (TANK_PLATFORM_WIDTH/2), y : tank2.getCoords().y + 0.001 },
            to : { x : SCREEN_RIGHT,  y : randomInRange(GROUND_MAX, GROUND_MIN) },
            unbreakable : false
        });

        let splitsToDo = Math.floor(randomInRange(MIN_SPLITS, MAX_SPLITS));
        let splitRuns = 0;

        while(splitsToDo > 0 && splitRuns < 200) {
            // Prevent endless loop in case no more splits are possible
            splitRuns++;

            const i = Math.floor(randomWithScale(this.groundLines.length));
            const groundLine = this.groundLines[i];
            if (groundLine.unbreakable) {
                continue;
            }

            const minX = groundLine.from.x + 0.01;
            const maxX = groundLine.to.x - 0.01;
            const distX = Math.abs(minX - maxX);

            if (distX < 0.03) continue;

            const maxY = Math.min((Math.min(groundLine.from.y, groundLine.to.y) + distX * 0.6), GROUND_MAX);
            const minY = Math.max((Math.max(groundLine.from.y, groundLine.to.y) - distX * 0.6), GROUND_MIN);

            const splitX = randomInRange(minX, maxX);
            const splitY =  randomInRange(minY, maxY);

            this.groundLines.splice(
                i,
                1,
                { from : groundLine.from, to : { x : splitX, y : splitY }, unbreakable : false },
                { from : { x : splitX, y : splitY }, to : groundLine.to, unbreakable : false }
            );

            splitsToDo--;
        }
    }

    intersectionTestLines() {
        return this.groundLines.map((groundLine : GroundLine) : IntersectionLine => ({
            from : groundLine.from,
            to : groundLine.to
        }));
    }

    addHit(x : number) {
        // TODO: Fix this ugly code

        for (let i : number = 0; i < this.groundLines.length; i++) {
            const groundLine = this.groundLines[i];

            // Test if line was hit. If unbreakable ignore hit
            if (x < groundLine.from.x || x > groundLine.to.x || groundLine.unbreakable) {
                continue;
            }

            // Determine polar vector for line
            const polarLineVector = cartesianToPolarVector(
                groundLine.from.x - groundLine.to.x,
                groundLine.from.y - groundLine.to.y,
            );

            // For this determine impact vector, this always 180deg to line vector
            const hitDirectionVector = polarToCartesianVector(0.01, (polarLineVector.theta + Math.PI/2));

            // See if impact is near one line corner, if so lower that corner
            if ((Math.abs(groundLine.from.x - x) < 0.02) || (Math.abs(groundLine.to.x - x) < 0.02)) {
                if (Math.abs(groundLine.from.x - x) <= Math.abs(groundLine.to.x - x)) {
                    if (i === 0 || !this.groundLines[i-1].unbreakable) {
                        this.groundLines[i].from.y += 0.01;
                        if (i > 0) {
                            this.groundLines[i - 1].to.y = Math.min(1.0, this.groundLines[i - 1].to.y + 0.01);
                        }
                    }
                } else {
                    if (i >= this.groundLines.length-2 || !this.groundLines[i+1].unbreakable) {
                        this.groundLines[i].to.y += 0.01;
                        if (i < this.groundLines.length-1) {
                            this.groundLines[i+1].from.y = Math.min(1.0, this.groundLines[i+1].from.y + 0.01);
                        }
                    }
                }

            // Else look if line is big enough to contain impact crater
            } else if (Math.abs(groundLine.to.x - groundLine.from.x) > 0.05) {

                const newPoints : GroundPointCoord[] = [
                    {
                        x : Math.max(groundLine.from.x, x - 0.02),
                        y : Math.min(1.0, groundLine.from.y + ((groundLine.to.y - groundLine.from.y) * ((x - groundLine.from.x - 0.02) / (groundLine.to.x - groundLine.from.x))))
                    },
                    {
                        x : Math.max(groundLine.from.x, Math.min(groundLine.to.x, x) - hitDirectionVector.x),
                        y : Math.min(1.0, groundLine.from.y + ((groundLine.to.y - groundLine.from.y) * ((x - groundLine.from.x) / (groundLine.to.x - groundLine.from.x))) - hitDirectionVector.y)
                    },
                    {
                        x : Math.min(groundLine.to.x, x + 0.02),
                        y : Math.min(1.0, groundLine.from.y + ((groundLine.to.y - groundLine.from.y) * ((x - groundLine.from.x + 0.02) / (groundLine.to.x - groundLine.from.x))))
                    },
                    groundLine.to
                ];


                const newLines : GroundLine[] = [];
                let lastPoint : GroundPointCoord = groundLine.from;
                for(let j = 0; j < newPoints.length; j++) {
                    newLines.push({
                        from : lastPoint,
                        to : newPoints[j],
                        unbreakable : false
                    });
                    lastPoint = newPoints[j];
                }

                this.groundLines.splice.apply(this.groundLines, [ i, 1, ...newLines ]);


                // Impact crater can leave very short lines that are very hard to hit, so remove them
                for(let j = this.groundLines.length-2; j >= 1; j--) {
                    if ((this.groundLines[j].to.x - this.groundLines[j].from.x) < 0.01) {
                        this.groundLines[j-1].to = this.groundLines[j+1].from;
                        this.groundLines.splice(j, 1);
                    }
                }

            // Line hit is to short to add crater, lower lines besides it
            } else {
                this.groundLines[i].from.y = Math.min(1.0, this.groundLines[i].from.y + 0.01);
                this.groundLines[i].to.y = Math.min(1.0, this.groundLines[i].to.y + 0.01);
                if (i > 0 && !this.groundLines[i-1].unbreakable) {
                    this.groundLines[i-1].to.y = Math.min(1.0, this.groundLines[i-1].to.y + 0.01);
                }
                if (i < this.groundLines.length && !this.groundLines[i+1].unbreakable) {
                    this.groundLines[i+1].from.y = Math.min(1.0, this.groundLines[i+1].from.y + 0.01);
                }
            }

            return;
        }
    }

    draw() {

        if (this.groundLines.length === 0) {
            return [];
        }

        // Convert lines to SVG path to allow better point/path optimization
        let lastPoint : GroundPointCoord = this.groundLines[0].from;
        const pathElements : string[] = [ `M ${lastPoint.x} ${lastPoint.y}` ];
        for (let i : number = 0; i < this.groundLines.length; i++) {
            const groundLine : GroundLine = this.groundLines[i];
            if (groundLine.from.x !== lastPoint.x || groundLine.from.y !== lastPoint.y) {
                pathElements.push(`M ${groundLine.from.x} ${groundLine.from.y}`);
            }
            pathElements.push(`L ${groundLine.to.x} ${groundLine.to.y}`);
            lastPoint = groundLine.to;
        }

        const svgPath = pathElements.join(' ');

        return [
            new Path({
                path : svgPath,
                color : GROUND_COLOR
            })
        ];

    }
}