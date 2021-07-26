# useStorePath
React hook for subscribe to redux store and force redraw component
when specified path in the store changed

[![](https://img.shields.io/npm/l/use-store-path.svg?style=flat)](https://github.com/simprl/use-store-path/blob/main/LICENSE)
[![](https://img.shields.io/npm/v/use-store-path.svg?style=flat)](https://www.npmjs.com/package/use-store-path)

# Usage

```jsx
import { createStore } from 'redux';
import { Provider, useStore } from 'react-redux';
import { getUseStorePath } from 'use-store-path';

const store = createStore(reduce );

const exStore = {
  ...store,
  useStorePath: getUseStorePath(store),
}

const App = () => {
  return <Provider store={exStore} >
    <Container />
  </Provider>
}

const Container = () => {
  const { useStorePath } = useStore()
  const value1 = useStorePath([ 'path', 'to', 'value1' ])
  const value2 = useStorePath([ 'path', 'to', 'value2' ])
  return <Component value={value1} value2={value2} />
}
```

### Usage with Typescript
```tsx
interface Value {
    x: number;
    y: number;
}

const Container = () => {
  const { useStorePath } = useStore()
  const value1 = useStorePath<Value>([ 'path', 'to', 'value1' ])
  const value2 = useStorePath<Value>([ 'path', 'to', 'value2' ])
  return <Component value={value1} value2={value2} />
}
```

### You can use only 'redux' and 'use-store-path' libraries without 'react-redux'
```tsx
import { createStore } from 'redux';
import { getUseStorePath } from 'use-store-path';

const { dispatch, getState } = createStore(reduce);
const exStore = {
  ...store,
  useStorePath: getUseStorePath(store),
}
export const StoreContext = createContext<typeof extandedStore>(extandedStore);
export const useAppStore = () => useContext(StoreContext);

const App = () => {
  return <StoreContext.Provider store={exStore} >
    <Container />
  </StoreContext.Provider>
}

const Container = () => {
  const { useStorePath, dispatch } = useAppStore()
  const value1 = useStorePath([ 'path', 'to', 'value1' ])
  const value2 = useStorePath([ 'path', 'to', 'value2' ])
  return <Component value={value1} value2={value2} onChange={() => dispatch(actionX())} />
}
```

## API

### getUseStorePath({ subscribe, getState });

#### Parameters:

**subscribe(listener)** - Function that adds a change listener. (See redux documentation)

**getState()** - Function that return root state. (See redux documentation)

#### Returns:

Hook **useStorePath()**

### useStorePath(path: string[]): any;

#### Parameters:

**path: string[]** - Path to the value in the state.

#### Returns:

Value in the selected path. If value not exists, return **undefined**

## How it work

This library contains method **getSubscribePath({ subscribe, getState })**.  
This function
1. add listener for the changes in the redux store
2. return 2 methods:
    * **subscribePath(path: string[], subscription: Subscription)**
    * **getStateByPath(path: string[])**

**subscribePath** - Function that adds subscription into internal object by specified path
For example after call:
```js
subscribePath([], subscription1)
subscribePath(['a','b'], subscription2)
subscribePath(['a','c'], subscription3)
subscribePath(['a','c'], subscription4)
```
will created rootListener:
```
{
    subscribes: [ subscription1 ], children: {
        a: { subscribes: [], children: {
            b: { subscribes: [ subscription2 ] }
            c: { subscribes: [ subscription3, subscription4 ] }
        }}
    }
}
```
