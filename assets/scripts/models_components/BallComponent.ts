import { _decorator, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Node, ParticleSystem2D, PhysicsGroup, PhysicsSystem2D, Prefab, RigidBody2D, Sprite, UITransform, v2, Vec2, Vec3 } from 'cc';
import Ball from '../models/Ball';
import { Base } from '../base/Base';
import { ColliderListener } from '../models/interfaces/ColliderListener';
import GameUtils from '../utils/GameUtils';
const { ccclass, property } = _decorator;

export enum PHYSIC_GROUP {
    SHOOT_BUBBLE = 2,
    NONE_SHOOT_BUBBLE = 3,
}



@ccclass('BallComponent')
export class BallComponent extends Base {
    

    ball : Ball;
    @property(Sprite)
    sprite : Sprite;
    @property(Prefab)
    effectPrf : Prefab;


    colliderListener : ColliderListener;

    setGroup(type: PHYSIC_GROUP) {
        this.node.getComponent(Collider2D).group = type;
        this.node.getComponent(RigidBody2D).group = type;
    }
    protected onloaded(): void {
        this.ball = new Ball(this.node);
        
        let collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            collider.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            collider.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        }

        // Registering global contact callback functions
        // if (PhysicsSystem2D.instance) {
        //     PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //     PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        //     PhysicsSystem2D.instance.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
        //     PhysicsSystem2D.instance.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        // }
    }
    protected ondestroyed(): void {
        let collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
            collider.off(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            collider.off(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        }

        // Registering global contact callback functions
        // if (PhysicsSystem2D.instance) {
        //     PhysicsSystem2D.instance.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //     PhysicsSystem2D.instance.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        //     PhysicsSystem2D.instance.off(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
        //     PhysicsSystem2D.instance.off(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        // }
    }
    start() {
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called once when two colliders begin to contact
        console.log('onBeginContact');
        if (this.colliderListener) this.colliderListener.onBeginContact(selfCollider, otherCollider, contact);
    }
    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called once when the contact between two colliders just about to end.
        console.log('onEndContact');
        if (this.colliderListener) this.colliderListener.onEndContact(selfCollider, otherCollider, contact);
    }
    onPreSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called every time collider contact should be resolved
        console.log('onPreSolve');
        if (this.colliderListener) this.colliderListener.onPreSolve(selfCollider, otherCollider, contact);
    }
    onPostSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // will be called every time collider contact should be resolved
        console.log('onPostSolve')
        if (this.colliderListener) this.colliderListener.onPostSolve(selfCollider, otherCollider, contact);
    }
    update(deltaTime: number) {
        this.ball.node = this.node;
    }

    remove(callback? : (center: Vec2, radius: number) => void): void {
        let effect = instantiate(this.effectPrf);
        this.node.addChild(effect);
        this.sprite.node.removeFromParent();
        let center = GameUtils.v2Fromv3(this.node.worldPosition);
        let radius = GameUtils.getRadius(this.node)
        this.scheduleOnce(() => {
            callback && callback(center, radius);
            this.node.removeFromParent();

        }, 0.1);
    }

    logGroup() {
        console.log(this.node.getComponent(Collider2D).group, this.node.getComponent(RigidBody2D).group);
    }
    
}

