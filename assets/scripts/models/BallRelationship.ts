import { Vec2 } from "cc";
import Ball from "./Ball";
import GameUtils from "../utils/GameUtils";

export default class BallRelationship {
    nearList : {position: Vec2, empty : boolean}[] = [];
    ball : Ball;
    constructor(ball : Ball) {
        this.ball = ball;
        GameUtils.getPosNear(
            GameUtils.v2Fromv3(ball.node.worldPosition.clone()),
            GameUtils.getRadius(ball.node)
        ).forEach(vec2 => {
            this.nearList.push({
                position: vec2.position,
                empty : true
            });
        })
    }
}