import {IntersectionLine, IntersectionLineCoord, Object} from "../objects/object";

const CCW = (p1 : IntersectionLineCoord, p2 : IntersectionLineCoord, p3 : IntersectionLineCoord) : boolean => {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
};

const linesIntersect = (line1 : IntersectionLine, line2 : IntersectionLine) : boolean => {
    // See https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    return (
        CCW(line1.from, line2.from, line2.to) != CCW(line1.to, line2.from, line2.to)) &&
        (CCW(line1.from, line1.to, line2.from) != CCW(line1.from, line1.to, line2.to)
    );
};

export const objectsIntersect = (obj1 : Object, obj2 : Object) : boolean => {
    const obj1IntersectionLines = obj1.intersectionTestLines();
    const obj2IntersectionLines = obj2.intersectionTestLines();

    for(let i = 0; i < obj1IntersectionLines.length; i++) {
        for(let j = 0; j < obj2IntersectionLines.length; j++) {
            if (linesIntersect(
                obj1IntersectionLines[i],
                obj2IntersectionLines[j]
            )) {
                return true;
            }
        }
    }

    return false;
};