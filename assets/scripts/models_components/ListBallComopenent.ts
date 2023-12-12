import { _decorator, CCObject, CCString, Color, Component, ERaycast2DType, geometry, instantiate, Node, PhysicsSystem, PhysicsSystem2D, Prefab, SpriteFrame, UITransform, v2, Vec2, Vec3 } from 'cc';
import Ball from '../models/Ball';
import { BallComponent } from './BallComponent';
import { Spawn } from './Spawn';
import { Base } from '../base/Base';
const { ccclass, property } = _decorator;


@ccclass('ListBallComopenent')
export class ListBallComopenent extends Base {


    @property(Prefab)
    ballPrefab: Prefab;
    @property({ type: [Color] })
    listColorName: Color[] = [];
    @property([SpriteFrame])
    ballSpriteFrames: SpriteFrame[] = [];


    list : number[][] = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]

    protected onloaded(): void {
        // let rowSize = 10;
        // let count = 0;
        for (let i = 0; i < this.list.length; i++) {
            for (let j = 0; j < this.list[i].length; j++) {
                let ballNode = instantiate(this.ballPrefab);
                let size = (ballNode.getComponent(UITransform).contentSize.width + ballNode.getComponent(UITransform).contentSize.height) / 2;
                let parentSize = this.node.getComponent(UITransform).contentSize;
                ballNode.setPosition(i % 2 == 0 ? (size * j + size / 2) - this.list.length * size / 2 - size / 2 : size * j - this.list.length * size / 2 - size / 2 , size * i - size);
                this.node.addChild(ballNode);
                let ball = ballNode.getComponent(BallComponent).ball;
                ballNode.getComponent(BallComponent).sprite.spriteFrame = this.ballSpriteFrames[this.list[i][j]];
                ball.color = this.listColorName[this.list[i][j]];
            }
        }
        // for (let i = 0; i < rowSize; i++) {
        //     for (let j = 0; j < ((i % 2 != 0) ? rowSize : rowSize - 1); j++) {
        //         let ballNode = instantiate(this.ballPrefab);
        //         let size = (ballNode.getComponent(UITransform).contentSize.width + ballNode.getComponent(UITransform).contentSize.height) / 2;
        //         let parentSize = this.node.getComponent(UITransform).contentSize;
        //         ballNode.setPosition(i % 2 == 0 ? (size * j + size / 2) - rowSize * size / 2 : size * j - rowSize * size / 2, size * i - size);
        //         this.node.addChild(ballNode);
        //         let ball = ballNode.getComponent(BallComponent).ball;
        //         ball.indexInList = count;
        //         ball.color = this.listColorName[1];
        //         if (i % 2 == 0) {
        //             ballNode.getComponent(BallComponent).ball.color = this.listColorName[0];
        //             ballNode.getComponent(BallComponent).sprite.spriteFrame = this.ballSpriteFrames[0];
        //         }
        //         // this.listBall.push(ballNode.getComponent(BallComponent).ball);
        //         count++;
        //     }
        // }
    }
    protected ondestroyed(): void {
    }
    start() {

    }

    update(deltaTime: number) {

    }

    isIntersecting(ball: Ball): boolean {
        this.node.getComponentsInChildren(BallComponent).forEach(bc => {
            const b = bc.ball;
            if (b.intersect(ball)) {

                if (b.node.getComponent(BallComponent).ball.color.equals(ball.color)) {
                    this.removeBall(b);
                    ball.node.parent.getComponent(Spawn).removeBall();

                }
                else {
                    ball.node.parent.getComponent(Spawn).removeBall();

                    console.log('add to list')
                    let indexColor = this.listColorName.indexOf(this.listColorName.find(c => c.equals(ball.color)));
                    let ballFrame = this.ballSpriteFrames[indexColor];
                    let ballNode = instantiate(this.ballPrefab);
                    ballNode.setWorldPosition(b.position.clone().x + b.size.width / 2, b.position.y - b.size.height / 2, 0);
                    ballNode.getComponent(BallComponent).sprite.spriteFrame = ballFrame;

                    this.node.addChild(ballNode);
                }

                return true;
            }
        })
        // for (let i = this.listBall.length - 1; i >= 0; i--) {
        //     let b = this.listBall[i];
        //     if (b.intersect(ball)) {
        //         console.log("ball intersect");
        //         this.removeBall(b)
        //         ball.node.parent.getComponent(Spawn).removeBall();
        //         return true;
        //     }
        // }
        return false;
    }
    removeBall(b: Ball | BallComponent) {
        b.node.getComponent(BallComponent).remove(() => {
            let list = this.node.getComponentsInChildren(BallComponent).filter(bc =>
                Vec2.distance(v2(b.node.worldPosition.x, b.node.worldPosition.y), v2(bc.node.worldPosition.x, bc.node.worldPosition.y)) <= this.getRadius(b.node) * 2 + this.getRadius(bc.node)
                && b.node.getComponent(BallComponent).ball.color.equals(bc.ball.color));
            list.forEach(bc => {
                this.removeBall(bc);
            });
        });

    }

    getRadius(node: Node): number {
        if (!node.getComponent(UITransform)) return 0;
        let size = node.getComponent(UITransform).contentSize;
        return (size.width + size.height) / 4;
    }

    findBestPlace(startPoint: Vec2, angle: number): Vec2 {
        let endPoint = startPoint.add(v2(1 * Math.sin(angle), 1 * Math.cos(angle)));
        let raycast = PhysicsSystem2D.instance.raycast(startPoint, endPoint, ERaycast2DType.Closest, 0xffffffff);
        if (raycast) {
        }
        return new Vec2();
    }
}

