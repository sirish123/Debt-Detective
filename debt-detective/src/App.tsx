import * as React from "react";
import "./App.css";

import logo from "./logo.svg";
import Test from "./test";

class App extends React.Component<
  {} & { parameter: string | null | undefined }
> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <br></br>
        {this.props.parameter}
        <Test />
      </div>
    );
  }
}

export default App;
