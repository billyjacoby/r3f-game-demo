import { Html } from "@react-three/drei";
import type { HtmlProps } from "@react-three/drei/web/Html";
import { useEffect, useRef } from "react";
import useGame from "./useGame";

export default function HtmlOverlay({ children, ...props }: HtmlProps) {
	const { paused } = useGame();
	const node = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (node.current?.parentElement) {
			node.current.parentElement.style.pointerEvents = "none";
			node.current.parentElement.style.whiteSpace = "nowrap";
		}
	});

	if (paused) return null;

	return (
		<Html ref={node} zIndexRange={[0, 0]} eps={0.1} {...props}>
			{children}
		</Html>
	);
}
