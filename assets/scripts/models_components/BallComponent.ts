import { _decorator, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Node, ParticleSystem2D, PhysicsSystem2D, Prefab, Sprite } from 'cc';
import Ball from '../models/Ball';
import { Base } from '../base/Base';
const { ccclass, property } = _decorator;

@ccclass('BallComponent')
export class BallComponent extends Base {
    

    ball : Ball;
    @property(Sprite)
    sprite : Sprite;
    @property(Prefab)
    effectPrf : Prefab;
    protected onloaded(): void {
        this.ball = new Ball(this.node);
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            collider.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            collider.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        }

        // Registering global contact callback functions
        if (PhysicsSystem2D.instance) {
            PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            PhysicsSystem2D.instance.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        }
    }
    protected ondestroyed(): void {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
            collider.off(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            collider.off(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        }

        // Registering global contact callback functions
        if (PhysicsSystem2D.instance) {
            PhysicsSystem2D.instance.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            PhysicsSystem2D.instance.off(Contact2DType.END_CONTACT, this.onEndContact, this);
            PhysicsSystem2D.instance.off(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            PhysicsSystem2D.instance.off(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        }
    }
    start() {

    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called once when two colliders begin to contact
        console.log('onBeginContact');
    }
    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called once when the contact between two colliders just about to end.
        console.log('onEndContact');
    }
    onPreSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called every time collider contact should be resolved
        console.log('onPreSolve');
    }
    onPostSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called every time collider contact should be resolved
        console.log('onPostSolve');
    }
    update(deltaTime: number) {
        this.ball.node = this.node;
    }

    remove(callback? : () => void): void {
        let effect = instantiate(this.effectPrf);
        this.node.addChild(effect);
        this.sprite.node.removeFromParent();
        this.scheduleOnce(() => {
            callback && callback();
            this.node.removeFromParent();
        }, 0.1);
    }
}

