import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { Helios } from '@laser-dac/helios';
import { Scene } from '@laser-dac/draw';
import Victor = require("victor");

import { ObjectInterface } from "./objects/objectInterface";
import { Projectile } from "./objects/projectile";
import { Ground } from "./objects/ground";
import { Tank } from "./objects/tank";
import {objectsIntersect} from "./util/intersection";
import {randomInRange} from "./util/random";

import {
    PLAYER_STATE_CHOOSING_ANGLE, PLAYER_STATE_CHOOSING_POWER, PLAYER_STATE_FIRING,
    PLAYER_STATE_IDLE,
    SCREEN_BOTTOM,
    SCREEN_LEFT,
    SCREEN_PLAYFIELD_TOP,
    SCREEN_RIGHT
} from "./util/const";

const VELOCITY = 0.00015;
const MIN_FIRE_SPEED = 20;
const MAX_FIRE_SPEED = 100;
const UPDATE_INTERVAL = 40;

interface ProjectileState {
    velocity : Victor,
    x : number,
    y : number
}

interface TankState {
    orientation : number,
    power : number
}

interface GameState {
    scoreTank1 : number,
    scoreTank2 : number,
    currentPlayer : number,
    playerState : number,
    angleIncrement : number,
    tank : TankState,
    projectile : ProjectileState
}

(async () => {

    const dac = new DAC();
    dac.use(new Simulator());
    if (process.env.DEVICE) {
         dac.use(new Helios());
    }
    await dac.start();

    const scene = new Scene({
        resolution : 50
    });

    const world : ObjectInterface[] = [];

    const gravityVector = new Victor(0, VELOCITY);

    function calculateFireVectorFromSpeedAndAngle(speed : number, angle : number) : Victor {
        return new Victor(
            VELOCITY * speed * Math.cos((angle * Math.PI * 2) / 360.0),
            VELOCITY * speed * Math.sin((angle * Math.PI * 2) / 360.0)
        );
    }

    const gameState : GameState = {
        scoreTank1 : 0,
        scoreTank2 : 0,
        currentPlayer : 1,
        playerState : PLAYER_STATE_IDLE,
        angleIncrement : 1,
        tank : {
            orientation : 180.0,
            power : 0.0
        },
        projectile : {
            x : 0.0,
            y : 0.0,
            velocity : new Victor(0,0)
        }
    };

    const tank1 = new Tank(randomInRange(SCREEN_LEFT+0.05, 0.45), randomInRange(SCREEN_PLAYFIELD_TOP, SCREEN_BOTTOM-0.2), 270.0);
    const tank2 = new Tank(randomInRange(0.55, SCREEN_RIGHT-0.05), randomInRange(SCREEN_PLAYFIELD_TOP, SCREEN_BOTTOM-0.2), 270.0);
    const projectile = new Projectile(gameState.projectile.x, gameState.projectile.y);
    const ground = new Ground(tank1, tank2);

    world.push(ground);
    world.push(tank1);
    world.push(tank2);
    world.push(projectile);

    function resetTankAndPlayerState() {
        gameState.playerState = PLAYER_STATE_IDLE;
        gameState.angleIncrement = 1;
        gameState.tank.orientation = 270;
        gameState.tank.power = 0.0;
    }

    function switchPlayer() {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        resetTankAndPlayerState();
    }

    function resetWorld() {
        tank1.updateCoordsAndOrientation(randomInRange(SCREEN_LEFT+0.05, 0.45), randomInRange(SCREEN_PLAYFIELD_TOP, SCREEN_BOTTOM-0.2), 270.0);
        tank2.updateCoordsAndOrientation(randomInRange(0.55, SCREEN_RIGHT-0.05), randomInRange(SCREEN_PLAYFIELD_TOP, SCREEN_BOTTOM-0.2), 270.0);
        ground.regenerate();
        resetTankAndPlayerState();
    }

    function handleProjectileFiring() {
        if (gameState.playerState !== PLAYER_STATE_FIRING) {
            return;
        }

        // Update coords
        gameState.projectile.velocity.add(gravityVector);
        gameState.projectile.x += gameState.projectile.velocity.toObject().x;
        gameState.projectile.y += gameState.projectile.velocity.toObject().y;
        projectile.updateCoords(gameState.projectile.x, gameState.projectile.y);
        projectile.updateDirection(gameState.projectile.velocity.angle());

        // Out of bound check
        if (gameState.projectile.x < SCREEN_LEFT || gameState.projectile.x > SCREEN_RIGHT) {
            switchPlayer();
        }

        // Ground hit check
        if (objectsIntersect(projectile, ground)) {
            ground.addHit(gameState.projectile.x);
            switchPlayer();
            return;
        }

        // Hit of tank1
        if (objectsIntersect(projectile, tank1)) {
            gameState.scoreTank2++;
            resetWorld();
            return;
        }

        // Hit of tank2
        if (objectsIntersect(projectile, tank2)) {
            gameState.scoreTank1++;
            resetWorld();
            return;
        }
    }

    function updateObjectsFromGameState() {
        projectile.updateVisibility(gameState.playerState === PLAYER_STATE_FIRING);
        tank1.updateScore(gameState.scoreTank1);
        tank2.updateScore(gameState.scoreTank2);

        if (gameState.playerState === PLAYER_STATE_CHOOSING_ANGLE) {
            const tank = (gameState.currentPlayer === 1) ? tank1 : tank2;
            tank.updateOrientation(gameState.tank.orientation);
        }

        if (gameState.playerState === PLAYER_STATE_CHOOSING_POWER) {
            const tank = (gameState.currentPlayer === 1) ? tank1 : tank2;
            // TODO
        }
    }

    function updateGameState() {
        // State machine
        // PLAYER_STATE_IDLE -> PLAYER_STATE_CHOOSING_ANGLE -> PLAYER_STATE_CHOOSING_POWER -> PLAYER_STATE_FIRING -> repeat

        if (gameState.playerState === PLAYER_STATE_IDLE) {
            // Go to choosing angle and reset angle increment
            gameState.playerState = PLAYER_STATE_CHOOSING_ANGLE;
            gameState.tank.orientation = 270;
            gameState.angleIncrement = (gameState.currentPlayer === 1) ? 1 : -1;
            return;

        } else if (gameState.playerState === PLAYER_STATE_CHOOSING_ANGLE) {
            const angleMin = (gameState.currentPlayer === 1) ? 270 : 180;
            const angleMax = (gameState.currentPlayer === 1) ? 360 : 270;
            if (gameState.tank.orientation >= angleMax) {
                gameState.angleIncrement = -1;
            } else if (gameState.tank.orientation <= angleMin) {
                gameState.angleIncrement = 1;
            }

            gameState.tank.orientation += gameState.angleIncrement;

            // TODO
            if (Math.random() > 0.98) {
                gameState.playerState = PLAYER_STATE_CHOOSING_POWER
            }

            return;

        } else if (gameState.playerState === PLAYER_STATE_CHOOSING_POWER) {

            // TODO
            const playerTank = (gameState.currentPlayer === 1) ? tank1 : tank2;
            gameState.playerState = PLAYER_STATE_FIRING;
            gameState.projectile.x = playerTank.getGunPointCoords().x;
            gameState.projectile.y = playerTank.getGunPointCoords().y;
            gameState.projectile.velocity = calculateFireVectorFromSpeedAndAngle(
                Math.random() * (MAX_FIRE_SPEED - MIN_FIRE_SPEED) + MIN_FIRE_SPEED,
                gameState.tank.orientation
            );

            return;
        }
    }

    function updateWorld() {
        updateGameState();
        updateObjectsFromGameState();
        handleProjectileFiring();
        setTimeout(updateWorld, UPDATE_INTERVAL);
    }
    updateWorld();

    scene.start(() => {
        for(let i : number = 0; i < world.length; i++) {
            const elements = world[i].draw();
            for(let j : number = 0; j < elements.length; j++) {
                scene.add(elements[j]);
            }
        }
    });

    dac.stream(scene, 20000, 30);

})();

