import { create, act } from 'react-test-renderer';
import {createElement, useEffect, useState} from "react";
import {createStore, Reducer, Store} from "redux";
import {getSubscribePath, getUseStorePath, UseStorePath,} from "./index";

const initState = { a: { b: "initBValue" } };

const reducer: Reducer<any, any> = (state = initState, action) =>
    (action.type === 'set') ? action.payload : state;

interface AppProps {
    store: ExStore;
    onRender: (v: unknown, v2: unknown) => void;
}
interface App3Props {
    store: ExStore;
    on1: (v: unknown) => void;
    on2: (v: unknown) => void;
    on3: (v: unknown) => void;
}

const App = ({ store, onRender }: AppProps) => {
    const { useStorePath } = store;
    const v = useStorePath<string>(['a','b']);
    const v2 = useStorePath<string>(undefined);
    onRender(v, v2);
    return null;
};

interface ExStore extends Store {
    useStorePath: UseStorePath;
}

describe('test hook', () => {
    const store = createStore(reducer);
    const exStore: ExStore = {
        ...store,
        useStorePath: getUseStorePath(store)
    };
    test('create app actor', async () => {
        const onRender = jest.fn();
        create(createElement(App, { store: exStore, onRender }));
        expect(onRender).toBeCalledTimes(1);
        expect(onRender).lastCalledWith('initBValue', undefined);
        await act(() => {
            store.dispatch({type: 'set', payload: 'value1' })
        });
        expect(onRender).toBeCalledTimes(2);
        await act(() => {
            store.dispatch({type: 'set', payload: 'value1' })
        });
        expect(onRender).toBeCalledTimes(2);

        await act(() => {
            store.dispatch({type: 'set', payload: {a:{b:'value2'}} })
        });
        expect(onRender).toBeCalledTimes(3);
        expect(onRender).lastCalledWith('value2', undefined);
    });

});


describe("subscribePath when dispatch from dispatch", () => {
    const store = createStore(reducer);
    const exStore: ExStore = {
        ...store,
        useStorePath: getUseStorePath(store)
    };
    const sequence: any[] = [];
    const App2 = ({ store, onRender }: AppProps) => {
        const { useStorePath } = store;
        const v1 = useStorePath<string>(['x', 'y', 'v2']);
        const v2 = useStorePath<string>(['x', 'y', 'v2']);
        sequence.push({ v1, v2 });
        useEffect(() => {
            sequence.push('subscription1_1')
            store.dispatch({type: 'set', payload: {x: {y: { v: `${v2}_from_queue1`, v2 }}} })
            sequence.push('subscription1_2')
            store.dispatch({type: 'set', payload: {x: {y: { v: `${v2}_from_queue2`, v2 }}} })
            sequence.push('subscription1_3')
        }, [v2]);
        onRender(v1, v2);
        return null;
    };

    const onRender = jest.fn();
    create(createElement(App2, { store: exStore, onRender }));

    test('first dispatch', async () => {
        await act(() => {
            sequence.push('act_1_1')
            store.dispatch({type: 'set', payload: {x: {y: {v: 'value6'}}} })
            sequence.push('act_1_2')
        });
        expect(onRender).toBeCalledTimes(1);
    });

    test('second dispatch (twice)', async () => {
        await act(() => {
            sequence.push('act_2_1')
            store.dispatch({type: 'set', payload: {x: {y: { v: 'value7', v2: 'value7'}}} })
            sequence.push('act_2_2')
            store.dispatch({type: 'set', payload: {x: {y: { v: 'value7', v2: 'value8'}}} })
            sequence.push('act_2_3')
        });
        await act(() => {
            sequence.push('act_3_1')
            store.dispatch({type: 'set', payload: {x: {y: { v: 'value7', v2: 'value9'}}} })
            sequence.push('act_3_2')
            store.dispatch({type: 'set', payload: {x: {y: { v: 'value7', v2: 'value10'}}} })
            sequence.push('act_3_3')
        });
        expect(onRender).toBeCalledTimes(3);

        const { getStateByPath } = getSubscribePath(store);
        expect(getStateByPath(['x', 'y', 'v'])).toBe('value10_from_queue2');
        expect(getStateByPath(['x', 'y', 'v2'])).toBe('value10');

        expect(sequence).toEqual([
            {
                "v1": undefined,
                "v2": undefined,
            },
            "subscription1_1",
            "subscription1_2",
            "subscription1_3",
            "act_1_1",
            "act_1_2",
            "act_2_1",
            "act_2_2",
            "act_2_3",
            {
                "v1": "value8",
                "v2": "value8",
            },
            "subscription1_1",
            "subscription1_2",
            "subscription1_3",
            "act_3_1",
            "act_3_2",
            "act_3_3",
            {
                "v1": "value10",
                "v2": "value10",
            },
            "subscription1_1",
            "subscription1_2",
            "subscription1_3",
        ]);
    });

})


describe("subscribePath when clear from dispatch", () => {
    const initState = {x: {y: { v: 'value8_from_queue2', v2: 'value8'}}};
    const reducer: Reducer<any, any> = (state = initState, action) =>
        (action.type === 'set') ? action.payload : state;
    const store = createStore(reducer);
    const exStore: ExStore = {
        ...store,
        useStorePath: getUseStorePath(store)
    };
    const sequence: any[] = [];

    const App3 = ({ store, on1, on2, on3 }: App3Props) => {
        const { useStorePath } = store;
        const [s3Enabled, setS3Enabled]=useState(true);
        const v2_s1 = useStorePath<string>(['x', 'y', 'v2']);
        const v2_s2 = useStorePath<string>(['x', 'y', 'v2']);
        const v3 = useStorePath<string>(s3Enabled ? ['x', 'y', 'v3'] : undefined);

        sequence.push({ v2_s1, v2_s2, v3, s3Enabled });
        useEffect(() => {
            if (v2_s1 !== initState.x.y.v2) {
                on1(v2_s1);
                sequence.push('subscription1_1')
                store.dispatch({type: 'set', payload: {x: {y: {v3: `${v2_s1}_from_queue1`, v2: v2_s1}}}})
                sequence.push('subscription1_2')
                store.dispatch({type: 'set', payload: {x: {y: {v3: `${v2_s1}_from_queue2`, v2: v2_s1}}}})
                sequence.push('subscription1_3')
                setS3Enabled(false);
                sequence.push('subscription1_4')
                store.dispatch({type: 'set', payload: {x: {y: {v3: `${v2_s1}_from_queue4`, v2: v2_s1}}}})
                sequence.push('subscription1_5')
            }
        }, [v2_s1]);

        useEffect(() => {
            if (v2_s2 !== initState.x.y.v2) {
                on2(v2_s2);
                sequence.push('subscription2');
                store.dispatch({type: 'set', payload: {x: {y: {v3: `${v2_s2}_from_queue3`, v2: v2_s2}}}})
                sequence.push('subscription2_1')
            }
        }, [v2_s2]);

        useEffect(() => {
            if (v3 !== undefined) {
                on3(v3);
                sequence.push('subscription3')
            }
        }, [v3]);
        return null;
    };

    const on1 = jest.fn();
    const on2 = jest.fn();
    const on3 = jest.fn();

    test('second dispatch', async () => {
        await act(() => {
            create(createElement(App3, { store: exStore, on1, on2, on3 }));
        });
        expect(on1).toBeCalledTimes(0);

        await act(() => {
            exStore.dispatch({type: 'set', payload: {x: {y: { v: 'value7', v2: 'value7'}}} })
        });
        expect(on1).toBeCalledTimes(1);

        const { getStateByPath } = getSubscribePath(store);
        expect(getStateByPath(['x', 'y', "v2"])).toBe('value7');
        expect(getStateByPath(['x', 'y', "v3"])).toBe('value7_from_queue3');
        // console.log(sequence);
        expect(sequence).toEqual([
            {
              "s3Enabled": true,
              "v2_s1": "value8",
              "v2_s2": "value8",
              "v3": undefined,
            },
            {
                "s3Enabled": true,
                "v2_s1": "value7",
                "v2_s2": "value7",
                "v3": undefined,
            },
            'subscription1_1',
            'subscription1_2',
            'subscription1_3',
            'subscription1_4',
            'subscription1_5',
            'subscription2',
            'subscription2_1',
            {
                "s3Enabled": false,
                "v2_s1": "value7",
                "v2_s2": "value7",
                "v3": undefined,
            },
        ]);
    });

})
