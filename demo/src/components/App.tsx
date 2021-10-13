import { useRecoilState, useRecoilValue, atom, selector } from 'recoil-naive';

const COUNTER_ATOM_KEY = '__counter_key__';

const counterAtom = atom({
    key: COUNTER_ATOM_KEY,
    default: 0,
});

const selectedCounterState = selector<number, string>({
    key: 'selectedCounterState',
    get: ({ get }) => {
        const counter = get(counterAtom);
        return `You got ${counter * 100}`;
    },
});

const App: React.FC = () => {
    const [count, setCount] = useRecoilState(COUNTER_ATOM_KEY);

    const derivedCount = useRecoilValue(selectedCounterState);

    return (
        <div>
            <p>Hello React!</p>
            <p>count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>

            <p>Derived count: {derivedCount}</p>
        </div>
    );
};

export default App;
