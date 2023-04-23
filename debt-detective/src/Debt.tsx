import React, { useState } from "react";
import SummaryGraph from "./SummaryGraph";
import PackageRenderComponent from "./PackageRenderComponent";
import CommunityRenderaComponent from "./CommunityRenderComponent";

// The Debt component receives a single prop: `data`, an object containing data about a project's technical debt

const Debt = (props: any) => {
  // useState is used to track which category the user has clicked on
  const [curSelect, setCurSelect] = useState(0);
  // This function determines which color (danger, warning, success) to use for an indicator based on the score in `props.data`
  function getColor(i : any){
    return props.data.scores[i] >= 70 ? "danger" : (props.data.scores[i] >= 40 ? "warning" : "success");
  }
  // These variables are used to determine the color of each category's indicator based on the score in `props.data`
  const pkg_vul_status = getColor(0);
  const activeness_status = getColor(1);
  const coding_status = getColor(2);
  const code_vul_status = getColor(3);
  const dead_code_status = getColor(4);

  // This function is called when a user clicks on a category indicator
  function handleClick(x : any){
    if(x === curSelect){
      setCurSelect(0); // if the user clicks on the already selected category, it gets deselected
    }else{
      setCurSelect(x); // otherwise, the clicked category becomes the new selected category
    }
  }

  // This function renders the appropriate content based on the selected category
  const renderBody = () => {
    if (curSelect === 0) {
      return <></>; // if no category is selected, return nothing
    } else if (curSelect === 1) {
      return (
        <PackageRenderComponent data={props.data} /> // if the user selects category 1, render the PackageRenderComponent with the "data" prop
      );
    } else if (curSelect === 2) {
      return (
        <CommunityRenderaComponent data={props.data} /> // if the user selects category 2, render the CommunityRenderaComponent with the "data" prop
      );
    }else if( curSelect == 3){
      return(
        <h5 className="m-2 p-2 border border-light">
          Squiggles in your code indicate that there is a problem with your code. The more squiggles, the more problems there are. The squiggles are color coded to indicate the severity of the problem. The squiggles are also grouped by type.
        </h5>
      );
    }
  };

  return (
    <div>

      <h2 className="text-light mb-2">Code Entropy Graph</h2>

      {/* Using the component that plots the radar chart which gives insights about the scores of all parameters */}
      <SummaryGraph data={props.data} />

      <div className="text-light">

        {/* The following five lines of code render a category indicator for each of the five categories */}
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

        {/* Calling the function written above to render data based on the category selected by user */}
        {renderBody()}
      </div>
    </div>
  );
};

export default Debt;
