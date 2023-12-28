import { _decorator, Component, Node, Size, UITransform, v2, Vec2, Vec3 } from 'cc';
export default class GameUtils {

    static getCircleLineIntersectionPoints(pointA: Vec2, pointB: Vec2, center: Vec2, radius: number): Vec2[] {
        const baX = pointB.x - pointA.x;
        const baY = pointB.y - pointA.y;
        const caX = center.x - pointA.x;
        const caY = center.y - pointA.y;

        const a = baX * baX + baY * baY;
        const bBy2 = baX * caX + baY * caY;
        const c = caX * caX + caY * caY - radius * radius;

        const pBy2 = bBy2 / a;
        const q = c / a;

        const disc = pBy2 * pBy2 - q;
        if (disc < 0) {
            return [];
        }

        const tmpSqrt = Math.sqrt(disc);
        const abScalingFactor1 = -pBy2 + tmpSqrt;
        const abScalingFactor2 = -pBy2 - tmpSqrt;

        const p1 = new Vec2(pointA.x - baX * abScalingFactor1, pointA.y - baY * abScalingFactor1);
        if (disc === 0) {
            return [p1];
        }

        const p2 = new Vec2(pointA.x - baX * abScalingFactor2, pointA.y - baY * abScalingFactor2);
        return [p1, p2];
    }
    static getVectorFromDistanceAndDirection(vectorA: Vec2, distance: number, directionVector: Vec2): Vec2 {
        // Normalize the direction vector to ensure it has a length of 1
        const normalizedDirection = directionVector.normalize();
        // Calculate the new vector by adding the scaled direction vector
        const vectorB = vectorA.add(normalizedDirection.multiplyScalar(distance));
        return vectorB;
    }
    static getDistanceFromRayCast(list: Vec2[], point: Vec2): {point: Vec2, distance: number} {

        if (list.length <= 0) return null;
        let ds: {point: Vec2, distance: number}[] = [];
        list.forEach(l => ds.push({
            point: l,
            distance: Vec2.distance(l, point)
        }));
        ds = ds.sort((a, b) => a.distance - b.distance);
        return ds[0];
    }
    static angle(cursor: Vec2, end: Vec2): number {
        let point = end.subtract(cursor);
        return v2(cursor.x, 0).angle(v2(end.x, point.y));
    }

    static v2Fromv3(vec: Vec3) {
        return v2(vec.clone().x, vec.clone().y);
    }

    static getRadius(ball: Node): number {
        let size = ball.getComponent(UITransform).contentSize;
        return (size.width + size.height) / 4;
    }
    static isInBound(node: Node, pos: Vec2): boolean {
        let uiTransform = node.getComponent(UITransform);
        if (!uiTransform) return false;
        let w = uiTransform.contentSize.x;
        let h = uiTransform.contentSize.y;
        let x = node.getWorldPosition().x;
        let y = node.getWorldPosition().y;
        return (x - w / 2 <= pos.x && y - h / 2 <= pos.y && x + w / 2 >= pos.x && y + h / 2 >= pos.y);
    }

    static getPositionInTile(bubble: Node, raycastPoint: Vec2) : Vec2 {
        let position = bubble.worldPosition.clone();
        let listPosNear = this.getPosNear(this.v2Fromv3(position), this.getRadius(bubble));
        listPosNear.sort((t1, t2) => t1.position.y - t2.position.y);
        listPosNear.splice(4, 2);
        listPosNear.sort((t1, t2) => {
            return Vec2.distance(t1.position, raycastPoint) - Vec2.distance(t2.position, raycastPoint);
        })
        return listPosNear[0].position;
    }
    static getPositionRaycastBound(startPosition: Vec2, angle: number, boundWidth: Size) : {position: Vec2, angle: number} {
        let startOx = v2(-boundWidth.width / 2, startPosition.y);
        let endOx = v2(boundWidth.width / 2, startPosition.y);
        let distance = 0;
        let findPos = new Vec2();
        let findAngle = angle;
        if(angle < Math.PI / 2) {
            distance = Vec2.distance(startPosition, endOx);
            let lengthFinded = Math.tan(angle) * distance;
            findPos.set(endOx.x, endOx.y + lengthFinded);
            findAngle = angle + Math.PI / 2;
        }
        else {
            distance = Vec2.distance(startPosition, startOx);
            let lengthFinded = Math.tan(Math.PI - angle) * distance;
            findPos.set(startOx.x, startOx.y + lengthFinded);
            findAngle = angle - Math.PI / 2;
        }

        return {position: findPos, angle: findAngle};
    }

    static isNear(pointA : Vec2, pointB : Vec2, odd : number): boolean {
        return Vec2.distance(pointA, pointB) <= odd;
    }
    static getPosNear(startPoint: Vec2, radius: number): {position: Vec2, dir: DIRECTION}[] {
        let list : {position: Vec2, dir: DIRECTION}[] = [];
        let angle = Math.PI / 3;
        let startAngle = 0 + angle / 2;
        for(let i = 0; i < 6; i++) {
            let ang = startAngle + angle * i;
            let vector = v2(0, radius * 2).rotate(ang);
            // vector.x *= Math.sin(ang);
            // vector.y *= Math.cos(ang);
            list.push({
                position: startPoint.clone().add(vector),
                dir: this.getDirectByAngle(Math.fround(ang * 180 / Math.PI)),
            });
        }
        return list;
    }
    static getDirectByAngle(angle: number) : DIRECTION{

        switch(angle) {
            case 30: return DIRECTION.LT;
            case 90: return DIRECTION.L;
            case 150: return DIRECTION.LB;
            case 210: return DIRECTION.RB;
            case 270: return DIRECTION.R;
            case 330: return DIRECTION.RT;
            default: return DIRECTION.NONE;
        }

    }
}
export enum DIRECTION {
    LT,
    L,
    LB,
    RT,
    R,
    RB,
    NONE
}