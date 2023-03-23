/** @jsxRuntime classic */
/* @jsx jsx */
import Rereact from "./rereact/Rereact"

/** @jsx Rereact.createElement */
const container = document.getElementById("root")

const updateValue = e => {
  rerender(e.target.value)
}

const rerender = value => {
 
  const element = (   
    <div>
      <h1>Rereact {value}</h1>
      <input onInput={updateValue} value={value} />
    </div>
  )
  Rereact.render(element, container)
}

rerender("Works")