import { Canvas } from "@react-three/fiber";
import React, {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { GameObjectLayer, GameObjectRef } from "./GameObject";
import type { SceneExitEvent } from "./Scene";
import createPubSub, { type PubSub } from "./utils/createPubSub";

export type GameObjectRegistry<T = GameObjectRef> = Map<symbol | string, T>;

export interface GameObjectRegistryUtils {
	registerGameObject: (identifier: symbol, ref: GameObjectRef) => void;
	unregisterGameObject: (identifier: symbol, ref: GameObjectRef) => void;
	findGameObjectById: (id: symbol) => GameObjectRef | undefined;
	findGameObjectByName: (name: string) => GameObjectRef | undefined;
	findGameObjectsByXY: (x: number, y: number) => GameObjectRef[];
	findGameObjectsByLayer: (layer: GameObjectLayer) => GameObjectRef[];
	// findGameObjects: (props: Partial<GameObjectProps>) => GameObjectRef[];
}

export interface GameContextValue extends GameObjectRegistryUtils, PubSub {
	settings: {
		movementDuration: number;
		cameraZoom: number;
	};
	paused: boolean;
	setPaused: Dispatch<SetStateAction<boolean>>;
	mapSize: [number, number];
	setMapSize: Dispatch<SetStateAction<[number, number]>>;
	setGameState: (key: string | symbol, value: any) => void;
	getGameState: (key: string | symbol) => any;
}

export const GameContext = React.createContext<GameContextValue | null>(null);

interface Props extends Partial<GameContextValue["settings"]> {
	children: React.ReactNode;
}

export default function Game({
	movementDuration = 250,
	cameraZoom = 64,
	children,
}: Props) {
	const [paused, setPaused] = useState(false);
	const [mapSize, setMapSize] = useState<[number, number]>(() => [1, 1]);
	const [registryById] = useState<GameObjectRegistry>(() => new Map());
	const [registryByName] = useState<GameObjectRegistry>(() => new Map());
	const [registryByXY] = useState<GameObjectRegistry<GameObjectRef[]>>(
		() => new Map(),
	);
	const [registryByLayer] = useState<GameObjectRegistry<GameObjectRef[]>>(
		() => new Map(),
	);
	const [pubSub] = useState(() => createPubSub());
	const [gameStore] = useState(() => new Map<string | symbol, any>());

	const storeUtils = useMemo(
		() => ({
			setGameState(key: string | symbol, value: string) {
				gameStore.set(key, value);
			},
			getGameState(key: string | symbol) {
				return gameStore.get(key);
			},
		}),
		[gameStore],
	);

	useEffect(() => {
		return pubSub.subscribe<SceneExitEvent>("scene-exit", async () => {
			registryById.clear();
			registryByName.clear();
			registryByXY.clear();
			registryByLayer.clear();
		});
	}, [pubSub, registryById, registryByLayer, registryByName, registryByXY]);

	const registryUtils = useMemo<GameObjectRegistryUtils>(
		() => ({
			registerGameObject(identifier, ref) {
				// register by id
				registryById.set(identifier, ref);
				// register by name
				ref?.name && registryByName.set(ref.name, ref);
				// register by x, y
				const { transform } = ref;
				const xy = `${transform.x},${transform.y}`;
				const xyList = registryByXY.get(xy) || [];
				xyList.push(ref);
				registryByXY.set(xy, xyList);
				// register by layer
				const layerList = ref.layer ? registryByLayer.get(ref.layer) || [] : [];
				layerList.push(ref);
				ref.layer && registryByLayer.set(ref.layer, layerList);
			},
			unregisterGameObject(identifier, ref) {
				// unregister by id
				registryById.delete(identifier);
				// unregister by name
				ref?.name && registryByName.delete(ref.name);
				// unregister by x, y
				const { transform } = ref;
				const xy = `${transform.x},${transform.y}`;
				const xyList = registryByXY.get(xy);
				xyList?.splice(xyList.indexOf(ref), 1);
				// unregister by layer
				const layerList = ref.layer
					? registryByLayer.get(ref.layer)
					: undefined;
				layerList?.splice(layerList.indexOf(ref), 1);
			},
			findGameObjectById(id) {
				return registryById.get(id);
			},
			findGameObjectByName(name) {
				return registryByName.get(name);
			},
			findGameObjectsByXY(x, y) {
				return (
					registryByXY.get(`${x},${y}`)?.filter((obj) => !obj.disabled) || []
				);
			},
			findGameObjectsByLayer(layer) {
				return registryByLayer.get(layer)?.filter((obj) => !obj.disabled) || [];
			},
		}),
		[registryById, registryByLayer, registryByName, registryByXY],
	);

	const contextValue: GameContextValue = {
		settings: {
			movementDuration,
			cameraZoom,
		},
		paused,
		setPaused,
		mapSize,
		setMapSize,
		...storeUtils,
		...registryUtils,
		...pubSub,
	};

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				position: "relative",
				userSelect: "none",
			}}
		>
			<Canvas
				camera={{
					position: [0, 0, 32],
					zoom: cameraZoom,
					near: 0.1,
					far: 64,
				}}
				orthographic
				gl={{ antialias: false }}
				onContextMenu={(e) => e.preventDefault()}
			>
				<GameContext.Provider value={contextValue}>
					{children}
				</GameContext.Provider>
			</Canvas>
		</div>
	);
}
