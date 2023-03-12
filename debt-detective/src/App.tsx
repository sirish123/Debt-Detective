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

  data = {
    scores: [45, 20, 75, 53, 32],
    vpkg: [
      {
        CVE: "CVE-2022-41896",
        advisory:
          "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41896: If 'ThreadUnsafeUnigramCandidateSampler' is given input 'filterbank_channel_count' greater than the allowed max size, TensorFlow will crash.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-rmg2-f698-wq35",
        package_name: "tensorflow",
        analyzed_version: "2.10.0",
      },
      {
        CVE: "CVE-2022-41896",
        advisory:
          "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41896: If 'ThreadUnsafeUnigramCandidateSampler' is given input 'filterbank_channel_count' greater than the allowed max size, TensorFlow will crash.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-rmg2-f698-wq35",
        package_name: "tensorflow",
        analyzed_version: "2.10.0",
      },
    ],
    stack: [
      "https://stackoverflow.com/questions/tagged/python",
      "https://stackoverflow.com/questions/18754276/python-for-beginners",
      "https://stackoverflow.blog/2021/07/14/getting-started-with-python/",
    ],
    community: [
      {
        pkgName: "tensorflow",
        forks: "100",
        stars: "200",
        score: "300",
      },
      {
        pkgName: "tensorflow",
        forks: "300",
        stars: "100",
        score: "400",
      },
      {
        pkgName: "tensorflow",
        forks: "150",
        stars: "50",
        score: "300",
      },
      {
        pkgName: "tensorflow",
        forks: "180",
        stars: "20",
        score: "300",
      },
    ],
  };

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
        <Debt data={this.data} />
      </div>
    );
  }
}

export default App;
