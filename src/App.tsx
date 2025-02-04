import {createSignal} from 'solid-js'
import './App.css'

function App() {
    const [count, setCount] = createSignal(0)

    return (
        <>
            <div class="h-full flex items-center justify-between ">
                <div>
                    <button class="btn btn-primary rounded-full w-64" onClick={() => setCount((count) => count + 1)}>
                        count is {count()}
                    </button>
                </div>
            </div>
        </>
    )
}

export default App
