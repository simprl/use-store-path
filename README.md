# use-store-path
Subscribe to redux store and force redraw component
when specified path in the store changed

# Usage

```jsx
import { createStore } from 'redux';
import { Provider } from 'react-redux';
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
  return <Component value={value} value2={value2} />
}
```
