const getSubscribePath = ({ getState, subscribe }) => {
  const listeners = new Map();
  const fireQueue = [];
  const subscribePath = (path, subscription) => {
    let listener;
    let curListeners = listeners;
    let state = getState();
    path.forEach((name) => {
      listener = curListeners.get(name);
      if (!listener) {
        listener = { subscribes: [], children: new Map() };
        curListeners.set(name, listener);
      }
      curListeners = listener.children;
      state = state && state[name];
    });
    if (listener) {
      listener.subscribes.push(subscription);
    }
    return [
      state,
      () => {
        listener.subscribes.splice(listener.subscribes.indexOf(subscription), 1);
      },
    ];
  };

  const fire = (prevState, state, subListeners) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [name, listener] of subListeners.entries()) {
      const prevSubState = prevState && prevState[name];
      const subState = state && state[name];
      if (prevSubState !== subState) {
        fireQueue.push(...listener.subscribes.map((subscription) => subscription.bind(null, subState)));
        fire(prevSubState, subState, listener.children);
      }
    }
  };

  const processQueue = () => {
    while (fireQueue.length > 0) fireQueue.shift()();
  };

  let prevState = null;
  const changeHandler = () => {
    const state = getState();
    const isWasEmpty = fireQueue.length === 0;
    fire(prevState, state, listeners);
    if (isWasEmpty) processQueue();
    prevState = state;
  };

  subscribe(changeHandler);

  return subscribePath;
};

export default getSubscribePath;
