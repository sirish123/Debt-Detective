import React, { useState } from "react";
import Parameter from "./parameter";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const SummaryGraph = (props: any) => {
  const data = [
    {
      name: "PackageVulnerability",
      A: props.data.scores[0],
      fullMark: 100,
    },
    {
      name: "Community",
      A: props.data.scores[1],
      fullMark: 100,
    },
    {
      name: "CodingStandard",
      A: props.data.scores[2],
      fullMark: 100,
    },
    {
      name: "CodeSecurity",
      A: props.data.scores[3],
      fullMark: 100,
    },
    {
      name: "DeadCode",
      A: props.data.scores[4],
      fullMark: 100,
    },
  ];

  return (
    <div className="">
      <h3 className="text-light text-center">Analysis By Debt Detective</h3>

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
    </div>
  );
};

export default SummaryGraph;
