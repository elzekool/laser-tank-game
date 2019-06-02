export const randomWithScale = (scale : number) : number => {
    return Math.random() * scale;
};

export const randomInRange = (min : number, max : number) : number => {
    // Allow min and max to be switched
    const rMax = Math.max(min, max);
    const rMin = Math.min(min, max);
    return randomWithScale(rMax - rMin) + rMin;
};
