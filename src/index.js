/** @jsxRuntime classic */
/* @jsx jsx */
import Rereact from "./rereact/Rereact"

/** @jsx Rereact.createElement */


// const updateValue = e => {
//   rerender(e.target.value)
// }

// const rerender = value => {
 
//   const element = (   
//     <div>
//       <h1>Rereact {value}</h1>
//       <input onInput={updateValue} value={value} />
//     </div>
//   )
//   Rereact.render(element, container)
// }

// rerender("Works")


function App(){
  const [state] = Rereact.useState("Works");
  return (
    <div>
        <h1>Rereact {state} </h1>
    </div>
  );
}

function Counter() {
  const [state, setState] = Rereact.useState(1);
  return (
    <div>
      <h1> 
        Count: {state}
      </h1>
      <button onClick={() => setState(c => c + 1)}>Count</button>
    </div>
  );
}
const element =<div> <App /><Counter/></div>;
const container = document.getElementById("root")
Rereact.render(element, container);