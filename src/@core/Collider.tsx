import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import type { GameObjectRef, Position } from "./GameObject";
import type {
	CannotMoveEvent,
	DidChangePositionEvent,
	MoveDirection,
} from "./Moveable";
import useComponentRegistry, {
	type ComponentRef,
} from "./useComponentRegistry";
import useGame from "./useGame";
import useGameObject from "./useGameObject";
import useGameObjectEvent from "./useGameObjectEvent";
import type { PubSubEvent } from "./utils/createPubSub";

export type CollisionCallback = (obj: GameObjectRef) => void;
export type CollisionEvent = PubSubEvent<"collision", GameObjectRef>;
export type TriggerEvent = PubSubEvent<"trigger", GameObjectRef>;
export type TriggerExitEvent = PubSubEvent<"trigger-exit", GameObjectRef>;

export type ColliderRef = ComponentRef<
	"Collider",
	{
		walkable: boolean;
		setWalkable: Dispatch<SetStateAction<boolean>>;
		canCrossEdge: (position: Position, direction: MoveDirection) => boolean;
		onCollision: (ref: GameObjectRef) => void;
		onTrigger: (ref: GameObjectRef) => void;
		onTriggerExit: (ref: GameObjectRef) => void;
	}
>;

interface Props {
	isTrigger?: boolean;
}

export default function Collider({ isTrigger = false }: Props) {
	const { findGameObjectsByXY } = useGame();
	const { id, getRef, publish, transform } = useGameObject();
	const [walkable, setWalkable] = useState(isTrigger);
	const prevPosition = useRef<Position>(transform);

	useGameObjectEvent<CannotMoveEvent>("cannot-move", ({ x, y }) => {
		for (const collider of findGameObjectsByXY(x, y).map((obj) =>
			obj.getComponent<ColliderRef>("Collider"),
		)) {
			collider.onCollision(getRef());
		}
	});

	useGameObjectEvent<DidChangePositionEvent>(
		"did-change-position",
		({ x, y }) => {
			for (const collider of findGameObjectsByXY(x, y)
				.filter((obj) => obj.id !== id) // skip self
				.map((obj) => obj.getComponent<ColliderRef>("Collider"))) {
				collider?.onTrigger(getRef());
			}
		},
	);

	useGameObjectEvent<DidChangePositionEvent>(
		"did-change-position",
		(nextPosition) => {
			const { x, y } = prevPosition.current;
			for (const collider of findGameObjectsByXY(x, y)
				.filter((obj) => obj.id !== id) // skip self
				.map((obj) => obj.getComponent<ColliderRef>("Collider"))) {
				collider?.onTriggerExit(getRef());
			}

			prevPosition.current = nextPosition;
		},
	);

	useComponentRegistry<ColliderRef>("Collider", {
		walkable,
		setWalkable,
		// deprecated, not in use
		canCrossEdge() {
			return true;
		},
		onCollision(ref) {
			publish<CollisionEvent>("collision", ref);
		},
		onTrigger(ref) {
			publish<TriggerEvent>("trigger", ref);
		},
		onTriggerExit(ref) {
			publish<TriggerExitEvent>("trigger-exit", ref);
		},
	});

	return null;
}
