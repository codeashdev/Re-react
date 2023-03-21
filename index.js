import Rereact from "./src/Rereact/Rereact";

/** @jsx Rereact.createElement */

const element = (
  <div>
    <h1>Rereact</h1>
  </div>
);
const container = document.getElementById("root");
Rereact.render(element, container);
