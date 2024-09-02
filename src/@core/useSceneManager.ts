import { useContext } from 'react';
import { type SceneManagerContextValue, SceneManagerContext } from './SceneManager';

export default function useSceneManager() {
    return useContext(SceneManagerContext) as SceneManagerContextValue;
}
