import { _decorator, Component, EventTouch, Graphics, Input, input, instantiate, Node, Prefab, Quat, tween, UITransform, v2, Vec2, Vec3 } from 'cc';
import { BallComponent } from './BallComponent';
import { Base } from '../base/Base';
const { ccclass, property } = _decorator;

export type OnTouch = {
    onTouchStart: (startPos: Vec2) => void;
    onTouchMove: (angle: number) => void;
    onTouchEnd: (angle?: number) => void;
}


@ccclass('Spawn')
export class Spawn extends Base {
    clearShoot() {
        this._shooting = false;
    }
    
    removeBall() {
        this.currenBall.getComponent(BallComponent).remove();
        this.addBall();
    }

    @property(Prefab)
    ballPrf: Prefab;
    currenBall: Node;
    private _canDrag: boolean = false;
    onTouch: OnTouch;
    currentRad : number = 0;
    ballSpeed: number = 300;
    private _shooting : boolean = false;

    protected onloaded(): void {
        this.addBall();
    }
    protected ondestroyed(): void {
    }
    start() {

    }

    protected onTouchStart(event: EventTouch) {
        let ball = this.node.children[0];
        if (ball) {
            if (this.isInBound(ball, event.getUILocation())
                && this.isInBound(this.node, v2(ball.worldPosition.x, ball.worldPosition.y))
            ) {
                this._canDrag = true;
                if (this.onTouch) {
                    this.onTouch.onTouchStart(v2(this.node.worldPosition.clone().x, this.node.worldPosition.clone().y));
                }
            }
        }
    }

    protected onTouchMove(event: EventTouch) {
        if (this._canDrag) {
            let ball = this.node.children[0];
            let ballPosition = v2(ball.worldPosition.clone().x, ball.worldPosition.clone().y);
            let touchPosition = event.getUILocation().clone();
            let ballFakePosition = v2(ballPosition.clone().x, 0);
            let touchFakePosition = v2(touchPosition.clone().x, touchPosition.clone().y - ballPosition.y);
            let angle = Vec2.angle(touchFakePosition.subtract(ballFakePosition), ballFakePosition);
            if (ballPosition.x < touchPosition.x && ballPosition.y >= touchPosition.y) {
                angle = 0.0001;
            }
            else if (ballPosition.x > touchPosition.x && ballPosition.y >= touchPosition.y) {
                angle = Math.PI - 0.0001;
            }
            // if (angle <= MIN_ANGLE) angle = MIN_ANGLE;
            // if (angle >= MAX_ANGLE) angle = MAX_ANGLE;
            let distance = Vec2.distance(touchPosition, ballPosition);
            if (distance > 128) {

                // let pos = v2(ball.getWorldPosition().x, ball.getWorldPosition().y);
                // this.line.moveTo(pos.x, pos.y);
                // let nextPos = pos.clone().multiplyScalar(1000);
                // nextPos = nextPos.rotate(angle);
                // this.line.lineTo(nextPos.x, nextPos.y);
                // this.line.stroke();

            }
            this.onTouch && this.onTouch.onTouchMove(angle);
        }
    }

    protected onTouchEnd(event: EventTouch) {
        if (this._canDrag) {
            let ball = this.node.children[0];
            let ballPosition = v2(ball.worldPosition.clone().x, ball.worldPosition.clone().y);
            let touchPosition = event.getUILocation().clone();
            let ballFakePosition = v2(ballPosition.clone().x, 0);
            let touchFakePosition = v2(touchPosition.clone().x, touchPosition.clone().y - ballPosition.y);
            let angle = Vec2.angle(touchFakePosition.subtract(ballFakePosition), ballFakePosition);
            if (ballPosition.x < touchPosition.x && ballPosition.y >= touchPosition.y || ballPosition.x > touchPosition.x && ballPosition.y >= touchPosition.y) {
                this.onTouch && this.onTouch.onTouchEnd();
                return;
            }
            let distance = Vec2.distance(touchPosition, ballPosition);
            if (distance > 128) {

            }
            console.log("onTouchEnd", angle);
            this.onTouch && this.onTouch.onTouchEnd(angle);
            this.shot(angle);
            this._canDrag = false;

        }
    }

    update(deltaTime: number) {
        if (this._shooting) {
            let distance = deltaTime * this.currenBall.getComponent(BallComponent).ball.speed;
            let nextX = this.currenBall.worldPosition.x + Math.cos(this.currentRad) * distance;
            let nextY = this.currenBall.worldPosition.y + Math.sin(this.currentRad) * distance;
            this.currenBall.setWorldPosition(nextX, nextY, 0);
        }
        
    }
    addBall() {
        this._shooting = false;
        this.node.removeAllChildren();
        let ball = instantiate(this.ballPrf);
        ball.setPosition(0, 0, 0);
        this.node.addChild(ball);
        this.currenBall = ball;
    }

    shot(angle: number) {
        // this.isEmpty = true;
        this.currentRad = angle;
        this._shooting = true;
        
        // ball.setRotation(Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, angle));
    }

    isInBound(node: Node, pos: Vec2): boolean {
        let uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return false;
        let w = uiTransform.contentSize.x;
        let h = uiTransform.contentSize.y;
        let x = node.getWorldPosition().x;
        let y = node.getWorldPosition().y;
        return (x - w / 2 <= pos.x && y - h / 2 <= pos.y && x + w / 2 >= pos.x && y + h / 2 >= pos.y);
    }
}

