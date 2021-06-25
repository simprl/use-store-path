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
  const subscribePath = (path: string[], subscription: Subscription) => {
    let listener = rootListener;
    let curListeners = listener.children;
    let state: unknown = getState();
    path.forEach((name) => {
      const maybeListener = curListeners.get(name);
      if (maybeListener === undefined) {
        listener = { subscribes: [], children: new Map() };
        curListeners.set(name, listener);
      } else {
        listener = maybeListener
      }
      curListeners = listener.children;
      state = state && (state as Record<string, unknown>)[name];
    });
    listener.subscribes.push(subscription);
    return [
      state,
      () => {
        listener.subscribes.splice(listener.subscribes.indexOf(subscription), 1);
      },
    ];
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
      const queueFunc = fireQueue.shift();
      if(queueFunc) {
        queueFunc();
      }
    }
  };

  let prevState: S | null = null;
  const changeHandler = () => {
    const state = getState();
    const isWasEmpty = fireQueue.length === 0;
    fire(prevState, state, rootListener);
    if (isWasEmpty) processQueue();
    prevState = state;
  };

  subscribe(changeHandler);

  return subscribePath;
};

export default getSubscribePath;
