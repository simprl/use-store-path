# use-store-path
Subscribe to redux store and force redraw component
when specified path in the store changed

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

### getUseStorePath({ getState, subscribe });

#### Parameters:

**getState()** - Function that return root state. (See redux documentation)

**subscribe(listener)** - Function that adds a change listener. (See redux documentation)
#### Returns:

Hook **useStorePath()**

### useStorePath(path: string[]): any;

#### Parameters:

**path: string[]** - Path to the value in the state.

#### Returns:

Value in the selected path. If value not exists, return **undefined**
