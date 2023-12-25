import { _decorator, Component, Node, tween, TweenSystem } from 'cc';
import { Base } from '../base/Base';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Base {
    protected onloaded(): void {
        
    }
    protected ondestroyed(): void {
    }
    start() {
        let newPos = this.node.worldPosition.clone();
        newPos.y += 100;
        const self = this;
        tween(this.node).to(0.5, {worldPosition: newPos}).call(() => {
            TweenSystem.instance.ActionManager.removeAllActionsFromTarget(self.node);
            self.node.removeFromParent();
        }).start();
    }

    update(deltaTime: number) {
        
    }
}

