import { useEffect, useMemo, useState } from 'react';
import getSubscribePath, { Store } from './getSubscribePath';

export interface UseStorePathLegacy {
    <T = unknown>(path: string[] | undefined): T
}

const getUseStorePathLegacy = <S = any>(store: Store<S>): UseStorePathLegacy => {
  const { subscribePath, getStateByPath } = getSubscribePath(store);
  return <T = unknown>(path: string[] | undefined): T => {
      const initState = useMemo(() => getStateByPath(path), []);
      const [value, set] = useState(initState);
      useEffect(() => {
          const clear = subscribePath(path, (value) => set(() => value));
          set(() => getStateByPath(path));
          return clear;
      }, path ?? []);
      return value as T;
  };
};

export default getUseStorePathLegacy;
