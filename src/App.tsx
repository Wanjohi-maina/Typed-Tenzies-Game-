import { useState, useRef, useEffect } from "react"
import Die from "./Die"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"
import type {JSX} from "react"

const BEST_TIME_KEY = "tenzies-best-time"
const BEST_ROLLS_KEY = "tenzies-best-rolls"

function formatTime(totalSeconds:number):string {
    const minutes:number = Math.floor(totalSeconds / 60)
    const seconds:string = String(totalSeconds % 60).padStart(2, "0")

    return `${minutes}:${seconds}`
} 
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6
type DieData = {
    value: DieValue,
    isHeld: boolean,
    id: string
}
export default function App():JSX.Element {
    const [dice, setDice] = useState<DieData[]>(() => generateAllNewDice())
    const [rollCount, setRollCount] = useState<number>(0)
    const [time, setTime] = useState<number>(0)
    const [hasStarted, setHasStarted] = useState<boolean>(false)
    const [bestTime, setBestTime] = useState<number | null>(() => {
        const savedBestTime = localStorage.getItem(BEST_TIME_KEY)

        return savedBestTime ? Number(savedBestTime) : null
    })
    const [bestRolls, setBestRolls] = useState<number | null>(() => {
        const savedBestRolls = localStorage.getItem(BEST_ROLLS_KEY)

        return savedBestRolls ? Number(savedBestRolls) : null
    })
    const [windowSize, setWindowSize] = useState<{ width: number; height: number }>(() => ({
        width: window.innerWidth,
        height: window.innerHeight
    }))
    const buttonRef = useRef<HTMLButtonElement | null>(null)

    const gameWon: boolean = dice.every(die => die.isHeld) &&
        dice.every(die => die.value === dice[0].value)
        
    useEffect(() => {
        if (gameWon) {
            buttonRef.current?.focus()
        }
    }, [gameWon])

    useEffect(() => {
        function updateWindowSize():void {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener("resize", updateWindowSize)

        return () => window.removeEventListener("resize", updateWindowSize)
    }, [])

    useEffect(() => {
        if (!hasStarted || gameWon) return

        const intervalId = setInterval(() => {
            setTime(prevTime => prevTime + 1)
        }, 1000)

        return () => clearInterval(intervalId)
    }, [hasStarted, gameWon])

    useEffect(() => {
        if (!gameWon) return

        setBestTime(prevBestTime => {
            if (prevBestTime !== null && prevBestTime <= time) {
                return prevBestTime
            }

            localStorage.setItem(BEST_TIME_KEY, String(time))
            return time
        })

        setBestRolls(prevBestRolls => {
            if (prevBestRolls !== null && prevBestRolls <= rollCount) {
                return prevBestRolls
            }

            localStorage.setItem(BEST_ROLLS_KEY, String(rollCount))
            return rollCount
        })
    }, [gameWon, time, rollCount])

    function getRandomDieValue():DieValue {
        return Math.ceil(Math.random() * 6) as DieValue
    }
    function generateAllNewDice():DieData[] {
        return new Array(10)
            .fill(0)
            .map(()=> ({
                value: getRandomDieValue(),
                isHeld: false,
                id: nanoid()
            }))
    }
    
    function rollDice():void {
        if (!gameWon) {
            setHasStarted(true)
            setRollCount(prevCount => prevCount + 1)
            setDice(oldDice => oldDice.map(die =>
                die.isHeld ?
                    die :
                    { ...die, value: getRandomDieValue() }
            ))
        } else {
            setDice(generateAllNewDice())
            setRollCount(0)
            setTime(0)
            setHasStarted(false)
        }
    }

    function hold(id: string):void {
        setDice(oldDice => oldDice.map(die =>
            die.id === id ?
                { ...die, isHeld: !die.isHeld } :
                die
        ))
    }

    const diceElements: JSX.Element[] = dice.map(dieObj => (
        <Die
            key={dieObj.id}
            value={dieObj.value}
            isHeld={dieObj.isHeld}
            hold={() => hold(dieObj.id)}
            disabled={gameWon}
        />
    ))

    const formattedTime: string = formatTime(time)
    const formattedBestTime:string = bestTime === null ? "--" : formatTime(bestTime)
    const formattedBestRolls:string | number = bestRolls === null ? "--" : bestRolls

    return (
        <main>
            {gameWon && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    style={{ position: "fixed" }}
                />
            )}
            <div aria-live="polite" className="sr-only">
                {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
            </div>
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="stats" aria-label="Game stats">
                <div className="stat-card">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">{formattedTime}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Rolls</span>
                    <span className="stat-value">{rollCount}</span>
                </div>
            </div>
            <div className="best-stats" aria-label="Best scores">
                <p>Best Time: {formattedBestTime}</p>
                <p>Best Rolls: {formattedBestRolls}</p>
            </div>
            <div className="dice-container">
                {diceElements}
            </div>
            <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
                {gameWon ? "New Game" : "Roll"}
            </button>
            {gameWon && (
                <p className="win-message">
                    {"\u{1F389}"} You won in {formattedTime} with {rollCount} rolls!
                </p>
            )}
        </main>
    )
}

