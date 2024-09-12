import {useCallback, useRef, useSyncExternalStore} from 'react';
import getSubscribePath, { Store } from './getSubscribePath';

export interface UseStorePath {
    <Return = unknown, Path extends string[] | undefined = string[] | undefined>(path: Path): Path extends undefined ? undefined : Return
}

const getUseStorePath = <S = any>(store: Store<S>): UseStorePath => {
    const { subscribePath, getStateByPath } = getSubscribePath(store);
    return <Return = unknown, Path extends string[] | undefined = string[]>(path: Path): Path extends undefined ? undefined : Return => {
        const strPath = Array.isArray(path) ? path.join('.') : path;

        const valueRef = useRef<{ value: Return }>();
        const subscribe = useCallback((callback: () => void) => {
            valueRef.current = undefined;
            return subscribePath(path, (value) => {
                // getStateByPath return last state
                // so need to save snapshot which actual in moment when callback call
                valueRef.current = { value: value as Return };
                callback();
            });
        }, [strPath]);

        const getSnapshot = useCallback(() => {
            if (typeof path === "undefined") return undefined as Path extends undefined ? undefined : Return;
            return (valueRef.current ? valueRef.current.value : (getStateByPath(path) as Return)) as Path extends undefined ? undefined : Return;
        }, [strPath]);
        return useSyncExternalStore<Path extends undefined ? undefined : Return>(subscribe, getSnapshot);
    };
};

export default getUseStorePath;
