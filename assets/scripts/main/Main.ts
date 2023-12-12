import { _decorator, Canvas, Component, CurveRange, game, Graphics, instantiate, Line, Node, Prefab, Quat, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { Spawn } from '../models_components/Spawn';
import { ListBallComopenent } from '../models_components/ListBallComopenent';
import { BallComponent } from '../models_components/BallComponent';
import { Base } from '../base/Base';
const { ccclass, property } = _decorator;

const BULLET_SIZE = 32;

@ccclass('Main')
export class Main extends Base {
    protected onloaded(): void {
        let sefl = this;
        // this.line.strokeColor.fromHEX('#ff0000');
        // this.line.lineWidth = 5;
        this.spawn.onTouch = {
            onTouchStart(startPos) {
                startPos.x = startPos.x - sefl.node.getComponent(UITransform).contentSize.width / 2;
                startPos.y = startPos.y - sefl.node.getComponent(UITransform).contentSize.height / 2;
                // sefl.line.clear();
                sefl.startPos = startPos;
                sefl.drawLineBullet(startPos, 10);
            },
            onTouchMove(angle) {
                // sefl.line.clear();
                // sefl.line.moveTo(sefl.startPos.x, sefl.startPos.y);
                // let nextPoint = sefl.startPos.clone().multiply(v2(1, 100)).rotate(angle).rotate(- Math.PI / 2);
                // sefl.line.lineTo(-nextPoint.x, -nextPoint.y);
                // sefl.line.stroke();
                // sefl.currentLineRadian += angle * game.deltaTime;
                // if(sefl.currentLineRadian >= Math.PI * 2) {
                //     sefl.currentLineRadian = sefl.currentLineRadian - Math.PI * 2;
                // }
                // if(sefl.currentLineRadian <= 0) {
                //     sefl.currentLineRadian = Math.PI * 2 + sefl.currentLineRadian;
                // }
                sefl.listBall.findBestPlace(sefl.startPos.clone(), angle)
                sefl.moveLineBullets(sefl.startPos, angle - Math.PI / 2);
            },
            onTouchEnd(angle) {
                // sefl.line.clear();
                sefl.clearLineBullets();
            },
        }
    }
    protected ondestroyed(): void {
    }

    // @property(Graphics)
    // line : Graphics;
    @property(Spawn)
    spawn : Spawn;
    @property(Node)
    listBullet : Node;
    @property(Prefab)
    bulletPrefab : Prefab;
    @property(ListBallComopenent)
    listBall : ListBallComopenent;



    startPos : Vec2 = new Vec2();
    start() {

    }

    update(deltaTime: number) {
        this.spawn.currenBall&& this.listBall.isIntersecting(this.spawn.currenBall.getComponent(BallComponent).ball)
    }

    drawLineBullet(startPoint: Vec2, numberBullets: number) {
        this.listBullet.removeAllChildren();
        let currentY = BULLET_SIZE + this.spawn.node.getComponent(UITransform).contentSize.width / 2;
        for (let i = 0; i < Math.floor(numberBullets); i++) {
            let bullet = instantiate(this.bulletPrefab);
            let pos = v3(startPoint.x, currentY);
            let scale = (numberBullets - i) / numberBullets;
            // bullet.setScale(v3(scale, scale, scale));
            bullet.setPosition(pos);
            this.listBullet.addChild(bullet);
            currentY = pos.y + BULLET_SIZE * 2;
        }
    }

    moveLineBullets(startPoint : Vec2, angle: number) {
        this.listBullet.setRotation(Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, (angle)));
    }

    clearLineBullets() {
        this.listBullet.removeAllChildren();
    }
}

