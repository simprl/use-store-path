export default ({ getState, subscribe }) => {
  const listeners = new Map();
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
      state = state?.[name];
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
      const prevSubState = prevState?.[name];
      const subState = state?.[name];
      if (prevSubState !== subState) {
        listener.subscribes.forEach((subscription) => subscription(subState));
        fire(prevSubState, subState, listener.children);
      }
    }
  };

  let prevState = null;
  const changeHandler = () => {
    const state = getState();
    fire(prevState, state, listeners);
    prevState = state;
  };

  subscribe(changeHandler);

  return subscribePath;
};
