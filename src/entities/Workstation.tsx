import { useRef } from 'react';
import Collider from '../@core/Collider';
import GameObject, { type GameObjectProps } from '../@core/GameObject';
import Interactable, { type InteractionEvent } from '../@core/Interactable';
import Sprite, { type SpriteRef } from '../@core/Sprite';
import useGameObject from '../@core/useGameObject';
import useGameObjectEvent from '../@core/useGameObjectEvent';
import waitForMs from '../@core/utils/waitForMs';
import spriteData from '../spriteData';

function WorkstationScript() {
    const { getComponent } = useGameObject();
    const workState = useRef(false);

    useGameObjectEvent<InteractionEvent>('interaction', () => {
        workState.current = !workState.current;

        if (workState.current) {
            getComponent<SpriteRef>('Sprite').setState('workstation-2');
        } else {
            getComponent<SpriteRef>('Sprite').setState('workstation-1');
        }

        return waitForMs(400);
    });

    return null;
}

export default function Workstation(props: GameObjectProps) {
    return (
        <GameObject {...props}>
            <Sprite {...spriteData.objects} state="workstation-1" />
            <Collider />
            <Interactable />
            <WorkstationScript />
        </GameObject>
    );
}
