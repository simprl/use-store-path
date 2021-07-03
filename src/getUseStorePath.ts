import { useEffect, useMemo, useState } from 'react';
import getSubscribePath from './getSubscribePath';
import {Store} from "redux";

const getUseStorePath = <S = any>(store: Store<S>) => {
  const { subscribePath, initStateGetter } = getSubscribePath(store);
  return (path: string[]) => {
      const initState = useMemo(initStateGetter(path), path)
      const [v, set] = useState(initState);
      useEffect(() => subscribePath(path, (v) => set(() => v)), path);
      return v;
  };
};

export default getUseStorePath;
