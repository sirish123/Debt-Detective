import React, { useState } from "react";
import SummaryGraph from "./SummaryGraph";

const Debt = (props: any) => {
  const [curSelect, setCurSelect] = useState(0);

  const renderBody = () => {
    if (curSelect === 0) {
      return <></>;
    } else if (curSelect === 1) {
      return (
        <>
          <h1 style={{ color: "white" }}>PackageVulnerability</h1>
          {props.data.vpkg.map((item: any) => {
            return (
              <div style={{ color: "white" }}>
                <h3>{item.CVE}</h3>
                <h3>{item.package_name}</h3>
                <p>{item.advisory}</p>
              </div>
            );
          })}
        </>
      );
    } else if (curSelect === 2) {
      return (
        <>
          <h1 style={{ color: "white" }}>Community</h1>
          {props.data.community.map((item: any) => {
            return (
              <div style={{ color: "white" }}>
                <h3>{item.pkgName}</h3>
                <h3>{item.forks}</h3>
                <p>{item.stars}</p>
              </div>
            );
          })}
        </>
      );
    }
  };

  return (
    <div>
      <h1>Debt</h1>
      <SummaryGraph data={props.data} />
      //show all parameters here
      <div>
        <button
          onClick={() => {
            if (curSelect === 1) setCurSelect(0);
            else setCurSelect(1);
          }}
        >
          PackageVulnerability
        </button>
        <button
          onClick={() => {
            if (curSelect === 2) setCurSelect(0);
            else setCurSelect(2);
          }}
        >
          Community
        </button>
        <button
          onClick={() => {
            if (curSelect === 3) setCurSelect(0);
            else setCurSelect(3);
          }}
        >
          CodingStandard
        </button>
        <button
          onClick={() => {
            if (curSelect === 4) setCurSelect(0);
            else setCurSelect(4);
          }}
        >
          CodeSecurity
        </button>
        <button
          onClick={() => {
            if (curSelect === 5) setCurSelect(0);
            else setCurSelect(5);
          }}
        >
          DeadCode
        </button>

        {renderBody()}
      </div>
    </div>
  );
};

export default Debt;
