import React, { useState } from "react";
import "./App.css";
import logo from "./logo.svg";
import Test from "./SummaryGraph";
import { render } from "react-dom";
import Debt from "./Debt";

class App extends React.Component<
  {} & { parameter: string | null | undefined }
> {
  constructor(props: any) {
    super(props);
  }

  // renderBody = () => {
  //   if (this.props.parameter != null) {
  //     let req_json: any;

  //     try {
  //       req_json = JSON.parse(this.props.parameter);
  //       console.log(req_json);
  //       console.log(req_json.numpy);
  //       console.log(req_json.pandas[0]);
  //       return <h1>ValidJson</h1>;
  //     } catch (e) {
  //       return <h1>Invalid JSON</h1>;
  //     }
  //   } else {
  //     return <h1>Hello</h1>;
  //   }
  // };

  public render() {
    return (
      <div className="App bg-dark">
        <p>
          {/* The "parameter" prop is parsed as JSON and then mapped through to render a list of "Debt" components */}
          {JSON.parse(this.props.parameter!).map((obj: any) => (
            <Debt data={obj} />
          ))}
        </p>

        {/* <Debt data={JSON.parse(this.props.parameter!).get(0)} /> */}
      </div>
    );
  }
}

export default App;
