import { useContext } from 'react';
import { GameObjectContext, type GameObjectContextValue } from './GameObject';

export default function useGameObject() {
    return useContext(GameObjectContext) as GameObjectContextValue;
}
