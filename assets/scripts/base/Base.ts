import { _decorator, Component, EventTouch, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Base')
export abstract class Base extends Component {


    protected onLoad(): void {
        this.onloaded();
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDestroy(): void {
        this.ondestroyed();
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected abstract onloaded() : void;
    protected abstract ondestroyed() : void;
    protected onTouchStart(event: EventTouch) {}
    protected onTouchMove(event: EventTouch) {}
    protected onTouchEnd(event: EventTouch) {}
}

