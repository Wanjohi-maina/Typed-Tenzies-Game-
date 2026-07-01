 import type {JSX} from "react"
 import type {DieValue} from "./App"
 type PipPosition = Record<DieValue, string[]>
 const pipPositions: PipPosition = {
        1: ["center"],
        2: ["top-left", "bottom-right"],
        3: ["top-left", "center", "bottom-right"],
        4: ["top-left", "top-right", "bottom-left", "bottom-right"],
        5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
        6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"]
    }

 type DieProps = {
    value: DieValue,
    isHeld: boolean,
    hold: () => void,
    disabled: boolean
 }   
export default function Die({value, isHeld, hold, disabled}: DieProps):JSX.Element {
    const styles:React.CSSProperties = {
        backgroundColor: isHeld ? "#59E391" : "white"
    }

    const pips:JSX.Element[] = pipPositions[value].map((position:string):JSX.Element => (
        <span key={position} className={`pip pip-${position}`}></span>
    ))
    
    return (
        <button 
            style={styles}
            onClick={hold}
            aria-pressed={isHeld}
            aria-label={`Die with value ${value}, 
            ${isHeld ? "held" : "not held"}`}
            className="die"
            disabled={disabled}
        >
            {pips}
        </button>
    )
}
