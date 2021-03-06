import { useEffect, useMemo, useState } from 'react';
import getSubscribePath from './getSubscribePath';
import {Store} from "redux";

const getUseStorePath = <S = any>(store: Store<S>) => {
  const { subscribePath, getStateByPath } = getSubscribePath(store);
  return <T = unknown>(path: string[]): T => {
      const initState = useMemo(() => getStateByPath(path), [])
      const [value, set] = useState(initState);
      useEffect(() => {
          const clear = subscribePath(path, (value) => set(() => value));
          set(() => getStateByPath(path));
          return clear;
      }, path);
      return value as T;
  };
};

export default getUseStorePath;
