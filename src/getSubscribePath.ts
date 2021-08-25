import {Store} from 'redux';

export interface Subscription {
  (state: unknown): void
}
export interface Listener {
  subscribes: Subscription[],
  children: Map<string, Listener>,
}

interface QueueFunc {
  ():void;
}

const getSubscribePath = <S = any>({ getState, subscribe }: Store<S>) => {
  const rootListener: Listener = { subscribes: [], children: new Map() };
  const fireQueue: QueueFunc[] = [];

  const getStateByPath = (path: string[]) => {
    let state: unknown = getState();
    path.forEach((name) => {
      state = state && (state as Record<string, unknown>)[name];
    });
    return state;
  }

  const subscribePath = (path: string[], subscription: Subscription) => {
    let listener = rootListener;
    let curListeners = listener.children;
    path.forEach((name) => {
      const maybeListener = curListeners.get(name);
      if (maybeListener === undefined) {
        listener = { subscribes: [], children: new Map() };
        curListeners.set(name, listener);
      } else {
        listener = maybeListener
      }
      curListeners = listener.children;
    });
    listener.subscribes.push(subscription);
    return () => {
      listener.subscribes.splice(listener.subscribes.indexOf(subscription), 1);
    };
  };

  const fire = (prevState: unknown, state: unknown, { subscribes, children }: Listener) => {
    if (prevState !== state) {
      if (subscribes.length > 0) {
        fireQueue.push(...subscribes.map((subscription) => () => subscription(state)));
      }
      if (children.size > 0) {
        for (const [name, listener] of children.entries()) {
          const prevSubState = prevState && (prevState as Record<string, unknown>)[name];
          const subState = state && (state as Record<string, unknown>)[name];
          fire(prevSubState, subState, listener);
        }
      }
    }
  };

  const processQueue = () => {
    while (fireQueue.length > 0) {
      const queueFunc = fireQueue.shift() as ()=>void;
      queueFunc();
    }
  };

  let prevState: S | null = null;
  const changeHandler = () => {
    const state = getState();
    const isWasEmpty = fireQueue.length === 0;
    const _prevState = prevState
    prevState = state;
    fire(_prevState, state, rootListener);
    if (isWasEmpty) processQueue();
  };

  subscribe(changeHandler);

  return { subscribePath, getStateByPath };
};

export default getSubscribePath;
