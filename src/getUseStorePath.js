import { useEffect, useMemo, useState } from 'react';
import getSubscribePath from './getSubscribePath';

export default (store) => {
  const subscribePath = getSubscribePath(store);
  return (path) => {
    const [ref, initValue, clear] = useMemo(
      () => [{}, ...subscribePath(path, (v) => ref.set(v))],
      path,
    );
    const [v, set] = useState(initValue);
    ref.set = set;
    useEffect(() => clear, [clear]);
    return v;
  };
};
