import * as React from "react";
import "./App.css";

import logo from "./logo.svg";
import Test from "./test";

class App extends React.Component {
  public render() {
    return (
      <div className="App bg-dark">
        <Test />
      </div>
    );
  }
}

export default App;
