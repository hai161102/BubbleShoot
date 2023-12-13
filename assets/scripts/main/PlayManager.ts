import { _decorator, Canvas, Color, EPhysics2DDrawFlags, EventTouch, game, instantiate, Node, PhysicsSystem2D, Prefab, Quat, SpriteFrame, tween, TweenSystem, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { Base } from '../base/Base';
import { BallComponent } from '../models_components/BallComponent';
import Ball from '../models/Ball';
import GameUtils from '../utils/GameUtils';
const { ccclass, property } = _decorator;

const BULLET_SIZE = 32;

@ccclass('PlayManager')
export class PlayManager extends Base {
    @property(Canvas)
    canvas: Canvas;
    @property(Node)
    startPointNode: Node;
    @property(Node)
    listBall: Node;
    @property([SpriteFrame])
    listFrameBubble: SpriteFrame[] = [];
    @property([Color])
    listColor: Color[] = [];
    @property(Prefab)
    bubblePrefab: Prefab;
    @property(Prefab)
    bubbleNoColor: Prefab;

    @property(Node)
    listBullet: Node;
    @property(Prefab)
    bulletPrefab: Prefab;

    @property(Node)
    testIntersectionNode: Node;

    previewNode: Node;

    private _previousBubble: number = 0;
    private _canDrag: boolean = false;
    private _shooting: boolean = false;
    private _shootAngle: number = 0;
    private _maxCol: number = 0;
    private _maxRow: number = 6;

    protected onloaded(): void {
        this._maxCol = this.canvas.node.getComponent(UITransform).contentSize.width / instantiate(this.bubblePrefab).getComponent(UITransform).width;
        this.addShootBubble(this.startPointNode);
        this.loadArray();
    }
    loadArray() {
        this.node.removeAllChildren();
        this.listBall.removeAllChildren();
        for (let i = this._maxRow - 1; i >= 0; i--) {
            for (let j = 0; j < (i % 2 == 0 ? this._maxCol : this._maxCol - 1); ++j) {
                this.addNewBubble(this.listBall, j, i);
            }
        }
    }
    private touchstart(startPos: Vec2) {
        this.drawLineBullet(startPos, 20);
    }

    private touchmove(angle: number) {
        this._shootAngle = angle;
        // this.listBall.children.forEach(n => {
        //     n.getComponent(UIOpacity).opacity = 255;
        // })
        this.moveLineBullets(v2(this.startPointNode.worldPosition.x, this.startPointNode.worldPosition.y), angle - Math.PI / 2);
        let rayNode = this.findNearestRayCast(angle);
        if (rayNode) {
            let addPos = GameUtils.getPositionInTile(rayNode.node, rayNode.point);
            if (this.previewNode) {
                this.node.removeChild(this.previewNode);
            }
            this.previewNode = instantiate(this.bubbleNoColor);
            this.node.addChild(this.previewNode);
            this.previewNode.setWorldPosition(v3(addPos.x, addPos.y, 0));
        }
        // rayNode && (rayNode.node.getComponent(UIOpacity).opacity = 50);
    }
    private touchend(angle?: number) {
        this.clearLineBullets();
        if (this.previewNode) {
            this.node.removeChild(this.previewNode);
        }
        if (angle) {
            TweenSystem.instance.ActionManager.removeAllActionsByTag(1111);
            let rayNode = this.findNearestRayCast(angle);
            if (rayNode) {
                let addPos = GameUtils.getPositionInTile(rayNode.node, rayNode.point);
                let self = this;
                tween(this.startPointNode.children[0]).tag(1111).to(1, {
                    worldPosition: v3(addPos.x, addPos.y, 0)
                }, {
                    onUpdate(target, ratio) {
                        self.checkIntersecting(self.startPointNode.children[0].getComponent(BallComponent).ball);
                    },
                }).call(() => {
                    this.checkIntersecting(this.startPointNode.children[0].getComponent(BallComponent).ball);
                }).start();
            }
            // this.shot(angle);
        }
    }

    findNearestRayCast(angle: number): { node: Node, point: Vec2 } {
        let listRayCastNode: { node: Node, listPoint: Vec2[] }[] = [];
        let nextVector = GameUtils.getVectorFromDistanceAndDirection(
            GameUtils.v2Fromv3(this.startPointNode.children[0].worldPosition),
            1000,
            v2(1 * Math.cos(angle), 1 * Math.sin(angle))
        );
        this.listBall.children.forEach(n => {
            let list = GameUtils.getCircleLineIntersectionPoints(
                GameUtils.v2Fromv3(this.startPointNode.children[0].worldPosition),
                nextVector,
                GameUtils.v2Fromv3(n.worldPosition),
                GameUtils.getRadius(n)
            );
            if (list.length > 0) {
                listRayCastNode.push({ node: n, listPoint: list });
            }
        });
        listRayCastNode.sort((a, b) => {
            return GameUtils.getDistanceFromRayCast(a.listPoint, GameUtils.v2Fromv3(this.startPointNode.children[0].worldPosition)).distance
                - GameUtils.getDistanceFromRayCast(b.listPoint, GameUtils.v2Fromv3(this.startPointNode.children[0].worldPosition)).distance
        });

        if (listRayCastNode.length > 0) return {
            node: listRayCastNode[0].node,
            point: GameUtils.getDistanceFromRayCast(listRayCastNode[0].listPoint, GameUtils.v2Fromv3(this.startPointNode.children[0].worldPosition)).point
        };
        return null;
    }





    addNewBubble(parent: Node, col: number, row: number) {
        let index = Math.floor(Math.random() * this.listFrameBubble.length + 1) - 1;
        if (index != -1 && index < this.listFrameBubble.length && index < this.listColor.length) {
            if (this.bubblePrefab) {
                let bubble = instantiate(this.bubblePrefab);
                parent.addChild(bubble);
                bubble.getComponent(BallComponent).sprite.spriteFrame = this.listFrameBubble[index];
                bubble.getComponent(BallComponent).ball.color = this.listColor[index];
                bubble.getComponent(BallComponent).ball.indexInList = [row, col];
                let size = bubble.getComponent(UITransform).contentSize.clone();
                let realSize = v2(size.width, size.height).multiply2f(row % 2 == 0 ? this._maxCol : this._maxCol - 1, this._maxRow);
                let x = this.node.worldPosition.x + col * size.width + size.width / 2 - realSize.x / 2;
                let y = this.node.worldPosition.y + row * size.height * 0.75 - size.height / 2;
                bubble.setWorldPosition(v3(x, y, 0));

            }
        }

    }

    addShootBubble(parent: Node) {
        let getIndex = Math.floor(Math.random() * (this.listFrameBubble.length));
        if (this.bubblePrefab) {
            parent.removeAllChildren();
            let bubble = instantiate(this.bubblePrefab);
            console.log(getIndex);
            parent.addChild(bubble);
            bubble.getComponent(BallComponent).sprite.spriteFrame = this.listFrameBubble[getIndex];
            bubble.getComponent(BallComponent).ball.color = this.listColor[getIndex];
        }
    }
    removeCurrentBubbleShoot() {
        this._shooting = false;
        this.startPointNode.removeAllChildren();
        this.addShootBubble(this.startPointNode);
    }
    pong(ball: Node): number {
        let sizeCanvas = this.canvas.node.getComponent(UITransform).contentSize;
        let pos = ball.worldPosition.clone();
        let radius = GameUtils.getRadius(ball);
        if (pos.x - radius <= this.node.worldPosition.x - sizeCanvas.width / 2

            || pos.x + radius >= this.node.worldPosition.x + sizeCanvas.width / 2) {
            return -1;
        }
        return 1;
    }

    protected ondestroyed(): void {

    }

    update(deltaTime: number) {
        // if (this._shooting) {
        //     this.startPointNode.getComponentInChildren(BallComponent).ball.speed *= this.pong(this.startPointNode.children[0]);
        //     let distance = this.startPointNode.getComponentInChildren(BallComponent).ball.speed * game.deltaTime;
        //     let x = distance * Math.cos(this._shootAngle);
        //     let y = Math.abs(distance) * Math.sin(this._shootAngle);
        //     this.startPointNode.children[0] && this.startPointNode.children[0].setWorldPosition(this.startPointNode.children[0].worldPosition.clone().add3f(x, y, 0));

        //     this.checkIntersecting(this.startPointNode.children[0].getComponent(BallComponent).ball);
        // }
    }

    protected onTouchStart(event: EventTouch) {
        let ball = this.startPointNode.children[0];
        if (ball) {

            let condition1 = GameUtils.isInBound(ball, event.getUILocation());
            if (condition1 && !this._shooting) {
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
            this.touchend(angle);
            this._canDrag = false;

        }
    }
    shot(angle: number) {
        this._shootAngle = angle;
        this._shooting = true;
    }



    drawLineBullet(startPoint: Vec2, numberBullets: number) {
        this.listBullet.removeAllChildren();
        let currentY = BULLET_SIZE + this.startPointNode.getComponent(UITransform).contentSize.width / 2;
        for (let i = 0; i < Math.floor(numberBullets); i++) {
            let bullet = instantiate(this.bulletPrefab);
            let pos = v3(0, currentY);
            let scale = (numberBullets - i) / numberBullets;
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
        this.listBall.getComponentsInChildren(BallComponent).forEach(bc => {
            let b = bc.ball;
            if (b.intersect(ball)) {
                let newNode = instantiate(this.bubblePrefab);
                this.listBall.addChild(newNode);
                newNode.getComponent(BallComponent).ball.color = ball.color;
                newNode.setWorldPosition(ball.node.worldPosition.clone());
                let indexColor = this.listColor.indexOf(ball.color);
                newNode.getComponent(BallComponent).sprite.spriteFrame = this.listFrameBubble[indexColor];
                if (b.color.equals(ball.color)) {
                    // let l : BallComponent[] = []
                    // this.neareastGreatThanOne(b, l);
                    // console.log(l);
                    this.removeBall(b);
                }
                // else {

                // }
                this.removeCurrentBubbleShoot();
            }
        })
    }
    neareastGreatThanOne(b: Ball, list: BallComponent[]) {
        let arr = this.listBall.getComponentsInChildren(BallComponent).filter(bc => {
            let realDistance = Vec2.distance(
                GameUtils.v2Fromv3(b.node.worldPosition),
                GameUtils.v2Fromv3(bc.node.worldPosition));
            let maxDistance = GameUtils.getRadius(b.node) * 4 / 3 + GameUtils.getRadius(bc.node);
            return realDistance <= maxDistance
                && b.node.getComponent(BallComponent).ball.color.equals(bc.ball.color);
        });
        if (arr.length > 0) {
            arr.forEach(a => {
                list.push(a);
                this.neareastGreatThanOne(a.ball, list);
            })
        }
    }
    removeBall(b: Ball) {
        b.node.getComponent(BallComponent).remove((center, radius) => {
            let list = this.listBall.getComponentsInChildren(BallComponent).filter(bc => {
                let realDistance = Vec2.distance(center, GameUtils.v2Fromv3(bc.node.worldPosition));
                let maxDistance = radius * 2 + GameUtils.getRadius(bc.node);
                return realDistance <= maxDistance
                    && b.node.getComponent(BallComponent).ball.color.equals(bc.ball.color);
            });
            list.forEach(bc => {
                this.removeBall(bc.ball);
            });
        });

    }
}

