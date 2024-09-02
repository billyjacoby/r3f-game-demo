import { useContext } from 'react';
import { GameContext, type GameContextValue } from './Game';

export default function useGame() {
    return useContext(GameContext) as GameContextValue;
}
