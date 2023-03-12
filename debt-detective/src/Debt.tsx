import React, { useState } from "react";
import SummaryGraph from "./SummaryGraph";
import PackageRenderComponent from "./PackageRenderComponent";
import CommunityRenderaComponent from "./CommunityRenderComponent";

const Debt = (props: any) => {
  const [curSelect, setCurSelect] = useState(0);
  function getColor(i : any){
    return props.data.scores[i] >= 70 ? "danger" : (props.data.scores[i] >= 40 ? "warning" : "success");
  }
  const pkg_vul_status = getColor(0);
  const activeness_status = getColor(1);
  const coding_status = getColor(2);
  const code_vul_status = getColor(3);
  const dead_code_status = getColor(4);

  function handleClick(x : any){
    if(x === curSelect){
      setCurSelect(0);
    }else{
      setCurSelect(x);
    }
  }

  const renderBody = () => {
    if (curSelect === 0) {
      return <></>;
    } else if (curSelect === 1) {
      return (
        <PackageRenderComponent data={props.data} />
      );
    } else if (curSelect === 2) {
      return (
        <CommunityRenderaComponent data={props.data} />
      );
    }
  };

  return (
    <div>

      <h2 className="text-light mb-2">Code Entropy Graph</h2>

      <SummaryGraph data={props.data} />

      <div className="text-light">

        <h5 className="text-start m-3">
          <span className={"indicator btn btn-" + pkg_vul_status} onClick={() => {handleClick(1)}}></span>
          Package Vulnerability and Security
        </h5>
        <h5 className="text-start m-3">
          <span className={"indicator btn btn-" + activeness_status} onClick={() => {handleClick(2)}}></span>
          Community Activeness and Maintainance
        </h5>
        <h5 className="text-start m-3">
          <span className={"indicator btn btn-" + coding_status} onClick={() => {handleClick(3)}}></span>
          Coding Quality and Standard
        </h5>
        <h5 className="text-start m-3">
          <span className={"indicator btn btn-" + code_vul_status} onClick={() => {handleClick(4)}}></span>
          Code Vulnerability and Security
        </h5>
        <h5 className="text-start m-3">
          <span className={"indicator btn btn-" + dead_code_status} onClick={() => {handleClick(5)}}></span>
          Depreciated, Dead and Outdated code
        </h5>

        {renderBody()}
      </div>
    </div>
  );
};

export default Debt;
