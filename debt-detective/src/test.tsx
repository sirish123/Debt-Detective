import React, { useState } from "react";
import Parameter from "./parameter";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";

const Test = () => {

  const data = [
    {
      name: "Parameter1",
      A: 25,
      fullMark: 100
    },
    {
      name: "Parameter2",
      A: 50,
      fullMark: 100
    },
    {
      name: "Parameter3",
      A: 40,
      fullMark: 100
    },
    {
      name: "Parameter4",
      A: 27,
      fullMark: 100
    },
    {
      name: "Parameter5",
      A: 61,
      fullMark: 100
    }
  ];


  return (
    <div className="">
      {/* <p className="bg-success">Bootstrap Testing!</p> */}

      <h3 className="text-light text-center">Your Score</h3>

      <div className="Score_Graph d-flex align-items-center justify-content-center m-3 p-1 rounded">
        <RadarChart 
          cx={200}
          cy={150}
          outerRadius={100}
          width={400}
          height={270}
          data={data}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#ff0000"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </div>

      <div className="container m-3 Analysis rounded">
        <h3 className="text-light text-center my-4">Analysis by Debt Detector</h3>
        
        <Parameter name="Parameter1" percent="50%" knowmore="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." />
        <Parameter name="Parameter2" percent="25%" knowmore="Lorem Ipsum" />
        <Parameter name="Parameter3" percent="61%" knowmore="Lorem Ipsum" />
        <Parameter name="Parameter4" percent="27%" knowmore="Lorem Ipsum" />
        <Parameter name="Parameter5" percent="47%" knowmore="Lorem Ipsum" />

      </div>
    </div>
  );
};

export default Test;
