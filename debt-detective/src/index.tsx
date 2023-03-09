import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const container = document.getElementById("root");

ReactDOM.render(
  <App parameter={container?.getAttribute("parameter")} />,
  container as HTMLElement
);
