import { _decorator, Camera, Canvas, Color, Component, EventTouch, game, instantiate, Node, Prefab, Quat, SpriteFrame, UI, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { Base } from '../base/Base';
import { BallComponent } from '../models_components/BallComponent';
import Ball from '../models/Ball';
import { Spawn } from '../models_components/Spawn';
const { ccclass, property } = _decorator;

const BULLET_SIZE = 32;

@ccclass('PlayManager')
export class PlayManager extends Base {

    private _tileArray: number[][] = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        
    ]

    @property(Canvas)
    canvas: Canvas;
    @property(Node)
    startPointNode: Node;
    @property([SpriteFrame])
    listFrameBubble: SpriteFrame[] = [];
    @property([Color])
    listColor: Color[] = [];
    @property(Prefab)
    bubblePrefab: Prefab;

    @property(Node)
    listBullet: Node;
    @property(Prefab)
    bulletPrefab: Prefab;

    private listBubbles: BallComponent[] = [];

    private _previousBubble: number = 0;
    private _canDrag: boolean = false;
    private _shooting: boolean = false;
    private _shootAngle: number = 0;
    private _maxCol : number = 0;
    private _maxRow : number = 6;

    protected onloaded(): void {
        
        this._maxCol = this.canvas.node.getComponent(UITransform).contentSize.width /  instantiate(this.bubblePrefab).getComponent(UITransform).width;
        this.addShootBubble(this.startPointNode);
        this.loadArray();


    }
    loadArray() {
        this.node.removeAllChildren();
        this.listBubbles = [];
        for (let i = this._maxRow - 1; i >= 0 ; i--) {
            
            for (let j = 0; j < (i%2==0?this._maxCol:this._maxCol-1) ; ++j) {
                this.addNewBubble(this.node, j, i);
            }

        }
    }

    private touchstart(startPos: Vec2) {
        this.drawLineBullet(startPos, 10);
    }

    private touchmove(angle: number) {
        this.moveLineBullets(v2(this.startPointNode.worldPosition.x, this.startPointNode.worldPosition.y), angle - Math.PI / 2);
    }
    private touchend(angle?: number) {
        this.clearLineBullets();
    }

    addNewBubble(parent: Node, col: number, row: number) {
        let index = this._tileArray[row][col];
        if (index != -1 && index < this.listFrameBubble.length && index < this.listColor.length) {
            if (this.bubblePrefab) {
                let bubble = instantiate(this.bubblePrefab);
                parent.addChild(bubble);
                bubble.getComponent(BallComponent).sprite.spriteFrame = this.listFrameBubble[index];
                bubble.getComponent(BallComponent).ball.color = this.listColor[index];
                bubble.getComponent(BallComponent).ball.indexInList = [row, col];
                let size = bubble.getComponent(UITransform).contentSize.clone();
                let realSize = v2(size.width, size.height).multiply2f(this._tileArray[row].length, this._tileArray.length);
                let x = this.node.worldPosition.x + col * size.width + size.width / 2 - realSize.x / 2;
                let y = this.node.worldPosition.y + row * size.height;
                bubble.setWorldPosition(v3(x, y, 0));
                this.listBubbles.push(bubble.getComponent(BallComponent));

            }
        }

    }

    addShootBubble(parent: Node) {
        let getIndex = Math.floor(Math.random() * (this.listFrameBubble.length - 1));
        // if (this._previousBubble == getIndex) {
        //     this.addShootBubble(parent);
        //     return;
        // }
        if (this.bubblePrefab) {
            parent.removeAllChildren();
            let bubble = instantiate(this.bubblePrefab);
            console.log(getIndex);
            parent.addChild(bubble);
            bubble.getComponent(BallComponent).sprite.spriteFrame = this.listFrameBubble[getIndex];
            bubble.getComponent(BallComponent).ball.color = this.listColor[getIndex];
            // bubble.setPosition(this.startPointNode.position.clone());
        }
    }
    removeCurrentBubbleShoot() {
        this._shooting = false;
        this.startPointNode.removeAllChildren();
        this.addShootBubble(this.startPointNode);
    }
    pong(ball: Node) : number {
        let sizeCanvas = this.canvas.node.getComponent(UITransform).contentSize;
        let pos = ball.worldPosition.clone();
        let radius = this.getRadius(ball);
        if (pos.x - radius <= this.node.worldPosition.x - sizeCanvas.width / 2
        
        || pos.x + radius >= this.node.worldPosition.x + sizeCanvas.width / 2) {
            // ball.setWorldPosition(this.node.worldPosition.x - sizeCanvas.width / 2 + radius, pos.y, pos.z);
            return -1;
        }
        return 1;
    }

    getRadius(ball: Node): number {
        let size = ball.getComponent(UITransform).contentSize;
        return (size.width + size.height) / 4;
    }
    protected ondestroyed(): void {
    }
    update(deltaTime: number) {
        if (this._shooting) {
            this.startPointNode.getComponentInChildren(BallComponent).ball.speed *= this.pong(this.startPointNode.children[0]);
            let distance = this.startPointNode.getComponentInChildren(BallComponent).ball.speed * game.deltaTime;
            let x = distance * Math.cos(this._shootAngle);
            let y = Math.abs(distance) * Math.sin(this._shootAngle);
            this.startPointNode.children[0] && this.startPointNode.children[0].setWorldPosition(this.startPointNode.children[0].worldPosition.clone().add3f(x, y, 0));

            this.checkIntersecting(this.startPointNode.children[0].getComponent(BallComponent).ball);
        }
    }

    protected onTouchStart(event: EventTouch) {
        let ball = this.startPointNode.children[0];
        if (ball) {

            let condition1 = this.isInBound(ball, event.getUILocation());
            let condition2 = this.isInBound(this.startPointNode, v2(ball.worldPosition.x, ball.worldPosition.y));
            console.log(ball.worldPosition, event.getUILocation())
            console.log(condition1, condition2);
            if (condition1 && condition2) {
                console.log(ball)

                this._canDrag = true;
                this.touchstart(v2(this.startPointNode.worldPosition.clone().x, this.startPointNode.worldPosition.clone().y))
            }
        }
    }

    protected onTouchMove(event: EventTouch) {
        if (this._canDrag) {
            let ball = this.startPointNode.children[0];
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
            this.touchmove(angle);
        }
    }

    protected onTouchEnd(event: EventTouch) {
        if (this._canDrag) {
            let ball = this.startPointNode.children[0];
            let ballPosition = v2(ball.worldPosition.clone().x, ball.worldPosition.clone().y);
            let touchPosition = event.getUILocation().clone();
            let ballFakePosition = v2(ballPosition.clone().x, 0);
            let touchFakePosition = v2(touchPosition.clone().x, touchPosition.clone().y - ballPosition.y);
            let angle = Vec2.angle(touchFakePosition.subtract(ballFakePosition), ballFakePosition);
            if (ballPosition.x < touchPosition.x && ballPosition.y >= touchPosition.y || ballPosition.x > touchPosition.x && ballPosition.y >= touchPosition.y) {
                this.touchend();
                return;
            }
            let distance = Vec2.distance(touchPosition, ballPosition);
            if (distance > 128) {

            }
            console.log("onTouchEnd", angle);
            this.touchend(angle);
            this.shot(angle);
            this._canDrag = false;

        }
    }
    shot(angle: number) {
        this._shootAngle = angle;
        this._shooting = true;
    }

    isInBound(node: Node, pos: Vec2): boolean {
        let uiTransform = node.getComponent(UITransform);
        if (!uiTransform) return false;
        let w = uiTransform.contentSize.x;
        let h = uiTransform.contentSize.y;
        let x = node.getWorldPosition().x;
        let y = node.getWorldPosition().y;
        return (x - w / 2 <= pos.x && y - h / 2 <= pos.y && x + w / 2 >= pos.x && y + h / 2 >= pos.y);
    }

    drawLineBullet(startPoint: Vec2, numberBullets: number) {
        this.listBullet.removeAllChildren();
        let currentY = BULLET_SIZE + this.startPointNode.getComponent(UITransform).contentSize.width / 2;
        for (let i = 0; i < Math.floor(numberBullets); i++) {
            let bullet = instantiate(this.bulletPrefab);
            let pos = v3(0, currentY);
            let scale = (numberBullets - i) / numberBullets;
            // bullet.setScale(v3(scale, scale, scale));
            bullet.setWorldPosition(pos);
            this.listBullet.addChild(bullet);
            currentY = pos.y + BULLET_SIZE * 2;
        }
    }

    moveLineBullets(startPoint: Vec2, angle: number) {
        this.listBullet.setRotation(Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, (angle)));
    }

    clearLineBullets() {
        this.listBullet.removeAllChildren();
    }

    checkIntersecting(ball: Ball) {
        this.listBubbles.forEach(bc => {
            let b = bc.ball;
            if (b.intersect(ball)) {
                if (b.color.equals(ball.color)) {
                    this.removeBall(b);
                }
                else {
                    let lengthCol = this._tileArray[this._tileArray.length-2].length;
                    let arr : number[] = [];
                    for (let i = 0; i < lengthCol; i++) {
                        arr.push(-1);                    
                    }
                    let col = b.indexInList[1] + 1;
                    arr[col] = this.listColor.indexOf(this.listColor.find(c => c.equals(ball.color)));
                    this._tileArray.push(arr);
                    this.loadArray();
                }
                this.removeCurrentBubbleShoot();
            }
        })
        // this.node.getComponentsInChildren(BallComponent).forEach(bc => {
        //     const b = bc.ball;
        //     if (b.intersect(ball)) {

        //         if (b.node.getComponent(BallComponent).ball.color.equals(ball.color)) {
        //             this.removeBall(b);
        //             ball.node.parent.getComponent(Spawn).removeBall();

        //         }
        //         else {
        //             ball.node.parent.getComponent(Spawn).removeBall();

        //             console.log('add to list')
        //             let indexColor = this.listColorName.indexOf(this.listColorName.find(c => c.equals(ball.color)));
        //             let ballFrame = this.ballSpriteFrames[indexColor];
        //             let ballNode = instantiate(this.ballPrefab);
        //             ballNode.setWorldPosition(b.position.clone().x + b.size.width / 2, b.position.y - b.size.height / 2, 0);
        //             ballNode.getComponent(BallComponent).sprite.spriteFrame = ballFrame;

        //             this.node.addChild(ballNode);
        //         }

        //         return true;
        //     }
        // })
        // // for (let i = this.listBall.length - 1; i >= 0; i--) {
        // //     let b = this.listBall[i];
        // //     if (b.intersect(ball)) {
        // //         console.log("ball intersect");
        // //         this.removeBall(b)
        // //         ball.node.parent.getComponent(Spawn).removeBall();
        // //         return true;
        // //     }
        // // }
        // return false;
    }
    removeBall(b: Ball, done?: () => void) {
        this.listBubbles.splice(this.listBubbles.indexOf(b.node.getComponent(BallComponent)), 1);
        b.node.getComponent(BallComponent).remove(() => {
            let list = this.node.getComponentsInChildren(BallComponent).filter(bc =>
                Vec2.distance(v2(b.node.worldPosition.x, b.node.worldPosition.y), v2(bc.node.worldPosition.x, bc.node.worldPosition.y)) <= this.getRadius(b.node) * 2 + this.getRadius(bc.node)
                && b.node.getComponent(BallComponent).ball.color.equals(bc.ball.color));
            list.forEach(bc => {
                this.removeBall(bc.ball, done);
            });
            if (done && list.length <= 0) {
                done();
            }
        });

    }
}

