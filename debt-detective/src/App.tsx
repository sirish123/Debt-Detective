import React, { useState } from "react";
import "./App.css";
import logo from "./logo.svg";
import Test from "./SummaryGraph";
import { render } from "react-dom";
import Debt from "./Debt";

const obj = {
  scores: [80, 50, 40, 60, 57],
  community: [
    {
      PkgName: "pandas",
      stars: 37179,
      forks: 15898,
      score: 82,
    },
  ],
  vpkg: [
    {
      CVE: "CVE-2021-34141",
      advisory:
        'Numpy 1.22.0 includes a fix for CVE-2021-34141: An incomplete string comparison in the numpy.core component in NumPy before 1.22.0 allows attackers to trigger slightly incorrect copying by constructing specific string objects. \r\nNOTE: the vendor states that this reported code behavior is "completely harmless."\r\nhttps://github.com/numpy/numpy/issues/18993',
      package_name: "wrapt",
      analyzed_version: "1.12.",
    },
    {
      CVE: "CVE-2021-41496",
      advisory:
        "Numpy 1.22.0 includes a fix for CVE-2021-41496: Buffer overflow in the array_from_pyobj function of fortranobject.c, which allows attackers to conduct a Denial of Service attacks by carefully constructing an array with negative values. \r\nNOTE: The vendor does not agree this is a vulnerability; the negative dimensions can only be created by an already privileged user (or internally).\r\nhttps://github.com/numpy/numpy/issues/19000",
      package_name: "wrapt",
      analyzed_version: "1.12.",
    },
  ],
  community_subparameters: {
    age_of_repo: 1,
    contributors: 7,
    dependents: 12,
    mutliple_versions: 1,
    readme: 1,
    recent_releases: 0,
    stars_and_forks: 19
  },
  vpkg_subparameters: {
    
  },

  }

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
          {/* {JSON.parse(this.props.parameter!).map((obj: any) => (
            <Debt data={obj} />
          ))} */}
          <Debt data={obj} />
        </p>

        {/* <Debt data={JSON.parse(this.props.parameter!).get(0)} /> */}
      </div>
    );
  }
}

export default App;
