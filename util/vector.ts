export const polarToCartesianVector = (r : number, theta : number) : { x : number, y : number } => {
    return {
        x : r * Math.cos(theta),
        y : r * Math.sin(theta),
    };
};

export const cartesianToPolarVector = (x : number, y : number) : { r : number, theta : number } => {
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);

    return { r : r, theta : theta }
};

export const degsToRad = (degs : number) : number => {
    return ((degs * Math.PI * 2) / 360.0);
};