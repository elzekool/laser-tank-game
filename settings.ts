// Screen boundries. always keep some room at the sides, else negative coords will be send causing issues
export const SCREEN_TOP = 0.1;
export const SCREEN_LEFT = 0.15;
export const SCREEN_BOTTOM = 0.8;
export const SCREEN_RIGHT = 0.85;
export const SCREEN_PLAYFIELD_TOP = 0.4;

// Interval in mSec between game state updates
export const UPDATE_INTERVAL = 20;

// Gravity is the downward vector. Min and Max speeds are multiple of this vector
// Increment speeds, the higher the more difficult to get the exact angle and speed right
export const GRAVITY = 0.0015 / UPDATE_INTERVAL;
export const MIN_FIRE_SPEED = 10;
export const MAX_FIRE_SPEED = 100;

export const ANGLE_INCREMENT_SPEED = 30.0 / UPDATE_INTERVAL;
export const POWER_INCREMENT_SPEED = 30.0 / UPDATE_INTERVAL;

// A high point rate has less flickering but positioning gets less and less accurate
export const RESOLUTION = 150;
export const POINT_RATE = 20000;
export const FPS = 30;