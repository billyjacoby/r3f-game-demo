import { createRoot } from "react-dom/client";
import App from "./App";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(<App />);

type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
	timeout: number;
};
type RequestIdleCallbackDeadline = {
	readonly didTimeout: boolean;
	timeRemaining: () => number;
};

declare global {
	interface Window {
		requestIdleCallback: (
			callback: (deadline: RequestIdleCallbackDeadline) => void,
			opts?: RequestIdleCallbackOptions,
		) => RequestIdleCallbackHandle;
		cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
	}
}
