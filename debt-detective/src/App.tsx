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
      <div className="App bg-dark">
        <Test />
        <h1 style={{ color: "green" }}>{this.props.parameter}</h1>
      </div>
    );
  }
}

export default App;
