export interface Subscription {
  (state: unknown): void
}
export interface Listener {
  subscribes: Subscription[],
  children: Map<string, Listener>,
}

export interface Unsubscribe {
  (): void;
}

export interface Store<S> {
  getState(): S;
  subscribe(listener: () => void): Unsubscribe;
}

interface QueueItem {
  subscription: Subscription;
  state: unknown;
}

const getSubscribePath = <S = any>({ getState, subscribe }: Store<S>) => {
  const rootListener: Listener = { subscribes: [], children: new Map() };
  const fireQueue: (QueueItem | null)[] = [];

  const getStateByPath = (path: string[] | undefined) => {
    if(path === undefined) return undefined;
    let state: unknown = getState();
    path.forEach((name) => {
      state = state && (state as Record<string, unknown>)[name];
    });
    return state;
  }

  const subscribePath = (path: string[] | undefined, subscription: Subscription) => {
    if (path === undefined) {
      return () => {};
    }
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
      const index = listener.subscribes.indexOf(subscription);
      if (index !== -1) {
        listener.subscribes.splice(index, 1);
      }
      fireQueue.forEach((queueItem, index) => {
        if (queueItem && queueItem.subscription === subscription) {
          fireQueue[index] = null;
        }
      });
    };
  };

  const fire = (prevState: unknown, state: unknown, { subscribes, children }: Listener) => {
    if (prevState !== state) {
      if (subscribes.length > 0) {
        fireQueue.push(...subscribes.map((subscription) => ({ subscription, state })));
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
      const queueItem = fireQueue.shift();
      if(queueItem) queueItem.subscription(queueItem.state);
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
