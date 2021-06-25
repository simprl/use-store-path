import { useEffect, useMemo, useState } from 'react';
import getSubscribePath from './getSubscribePath';
import {Store} from "redux";

interface RefInterface {
    set?: (v: unknown) => void;
}

const getUseStorePath = <S = any>(store: Store<S>) => {
  const subscribePath = getSubscribePath(store);
  return (path: string[]) => {
    const [ref, initValue, clear] = <[RefInterface, unknown, () => void]>useMemo(
        () => [
          {},
          ...subscribePath(path, (v) => {
              if(ref.set) {
                  ref.set(v);
              }
          }),
        ],
        path
    );
    const [v, set] = useState(initValue);
    ref.set = set;
    useEffect(() => clear, [clear]);
    return v;
  };
};

export default getUseStorePath;
