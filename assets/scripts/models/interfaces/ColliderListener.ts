import { Collider2D, IPhysics2DContact } from "cc";

export interface ColliderListener {
    onBeginContact : (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => void;
    onEndContact: (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => void;
    onPreSolve: (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => void;
    onPostSolve: (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => void;
}