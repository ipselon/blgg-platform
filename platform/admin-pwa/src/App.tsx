import {useState} from 'react';
import {Button} from '@/components/ui/button.tsx';

function App() {
    const [counter, setCounter] = useState<number>(0);
    return (
        <div className="flex flex-col gap-3 p-4">
            <div>
                <p className="text-2xl font-bold">{counter}</p>
            </div>
            <div>
                <Button onClick={() => setCounter(counter + 1)}>Test</Button>
            </div>

        </div>
    );
}

export default App;
