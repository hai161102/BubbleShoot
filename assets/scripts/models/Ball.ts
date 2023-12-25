import { Color, Size, Vec2, Node, UITransform, Collider2D, physics, v2 } from "cc";

export default class Ball {
    intersect(b: Ball, odd? : number) : boolean{
        return this.getRect().intersectCircle(b.getRect(), odd);
    }
    position : Vec2 = new Vec2();
    size : Size = new Size(48, 48);
    color: Color = Color.BLUE;
    speed: number = 1000;
    gravity: number = 10;
    score: number = 10;
    indexInList: number[] = [];
    private _node: Node;
    public get node(): Node {
        return this._node;
    }
    public set node(value: Node) {
        this._node = value;
        this.update();
    }
    constructor(node: Node) {
        this._node = node;
        this.update();
    }
    update() {
        this.position.set(this._node.getWorldPosition().x, this._node.getWorldPosition().y);
        this.size.set(this._node.getComponent(UITransform).contentSize);
    }

    getRect() : Rect{
        this.update();
        let anchor = v2(this._node.getComponent(UITransform).anchorX, this._node.getComponent(UITransform).anchorY);
        return new Rect(
            this.position.x - anchor.x * this.size.width,
            this.position.x - anchor.x * this.size.width + this.size.width,
            this.position.y - anchor.y * this.size.height + this.size.height,
            this.position.y - anchor.y * this.size.height
        )
    }
}

export class Rect {
    left : number = 0;
    right : number = 0;
    top : number = 0;
    bottom : number = 0;

    constructor(left: number | Rect, right: number = 0, top: number = 0, bottom: number = 0) {
        if (left instanceof Rect) {
            this.left = left.left;
            this.right = left.right;
            this.top = left.top;
            this.bottom = left.bottom;
        }
        else {
            this.left = left
            this.right = right;
            this.top = top;
            this.bottom = bottom;
        }
        
    }

    center() : Vec2 {
        return new Vec2(this.left + (this.right - this.left) / 2, this.bottom + (this.top - this.bottom) / 2);
    }

    intersect(rect : Rect) : boolean {
        if(this.center().equals(rect.center())) return true;
        if (rect.center().x > this.center().x && rect.center().y > this.center().y) {
            return rect.left > this.left && rect.left < this.right && rect.bottom > this.bottom && rect.bottom < this.top;
        }
        if (rect.center().x < this.center().x && rect.center().y < this.center().y) {
            return rect.right > this.right && rect.right < this.left && rect.top > this.bottom && rect.top < this.top;
        }
        if(rect.center().x < this.center().x && rect.center().y > this.center().y) {
            return rect.right > this.right && rect.right < this.left && rect.bottom > this.bottom && rect.bottom < this.top;
        }
        if(rect.center().x > this.center().x && rect.center().y < this.center().y) {
            return rect.left > this.left && rect.left && rect.top > this.bottom && rect.top < this.top;
        }
        return false;
    }

    intersectCircle(rect: Rect, odd? : number) : boolean {

        let radius1 = Math.abs(this.left - this.right) / 2;
        let radius2 = Math.abs(rect.left - rect.right) / 2;

        let distance = Vec2.distance(this.center(), rect.center());
        return (distance - distance * odd) <= radius1 + radius2;
    }


}