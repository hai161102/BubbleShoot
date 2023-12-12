import { _decorator, Color, Component, ERaycast2DType, geometry, instantiate, Node, PhysicsSystem, PhysicsSystem2D, Prefab, SpriteFrame, UITransform, v2, Vec2, Vec3 } from 'cc';
import Ball from '../models/Ball';
import { BallComponent } from './BallComponent';
import { Spawn } from './Spawn';
import { Base } from '../base/Base';
const { ccclass, property } = _decorator;

@ccclass('ListBallComopenent')
export class ListBallComopenent extends Base {


    @property(Prefab)
    ballPrefab: Prefab;
    @property([SpriteFrame])
    ballSpriteFrames: SpriteFrame[] = [];

    protected onloaded(): void {
        let rowSize = 20;
        let count = 0;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                let ballNode = instantiate(this.ballPrefab);
                let size = (ballNode.getComponent(UITransform).contentSize.width + ballNode.getComponent(UITransform).contentSize.height) / 2;
                let parentSize = this.node.getComponent(UITransform).contentSize;
                ballNode.setPosition(i % 2 == 0 ? (size * j + size / 2) - rowSize * size / 2 : size * j - rowSize * size / 2, size * i - size - parentSize.height / 2);
                this.node.addChild(ballNode);
                ballNode.getComponent(BallComponent).ball.indexInList = count;
                if(i % 2 == 0) {
                    ballNode.getComponent(BallComponent).ball.color = Color.RED;
                    ballNode.getComponent(BallComponent).sprite.spriteFrame = this.ballSpriteFrames[0];
                }
                // this.listBall.push(ballNode.getComponent(BallComponent).ball);
                count++;
            }
        }
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
                
                if(b.node.getComponent(BallComponent).ball.color.equals(ball.color)) {
                    this.removeBall(b)
                }
                else {
                    let ballPrf = ball.node.parent.getComponent(Spawn).ballPrf;
                    let ballNode = instantiate(ballPrf);
                    ballNode.setWorldPosition(ball.node.getWorldPosition());
                    this.node.addChild(ballNode);
                }
                ball.node.parent.getComponent(Spawn).removeBall();

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
                Vec2.distance(v2(b.node.worldPosition.x, b.node.worldPosition.y), v2(bc.node.worldPosition.x, bc.node.worldPosition.y)) <= this.getRadius(b.node) + this.getRadius(bc.node)
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

    findBestPlace(startPoint : Vec2, angle : number) : Vec2 {
        let endPoint = startPoint.add(v2(1 * Math.sin(angle), 1 * Math.cos(angle)));
        console.log(startPoint, endPoint);
        let raycast = PhysicsSystem2D.instance.raycast(startPoint, endPoint, ERaycast2DType.Closest, 0xffffffff);
        if(raycast) {
            console.log(raycast)
        }
        return new Vec2();
    }
}

