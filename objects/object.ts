import { Shape } from '@laser-dac/draw/dist/Shape';

export interface IntersectionLineCoord {
    x : number,
    y : number
}

export interface IntersectionLine {
    from : IntersectionLineCoord,
    to : IntersectionLineCoord
}

export interface Object {
    intersectionTestLines() : IntersectionLine[],
    draw() : Shape[]
}