import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// Plot the Radar Chart using the data passed as props

const SummaryGraph = (props: any) => {
  const data = [
    {
      name: "Pkg-Vulnerability",
      A: props.data.scores[0],
      fullMark: 100,
    },
    {
      name: "Activeness",
      A: props.data.scores[1],
      fullMark: 100,
    },
    {
      name: "Coding-Standard",
      A: props.data.scores[2],
      fullMark: 100,
    },
    {
      name: "Code-Security",
      A: props.data.scores[3],
      fullMark: 100,
    },
    {
      name: "Dead-Code",
      A: props.data.scores[4],
      fullMark: 100,
    },
  ];

  return (
    <div className="">

      <div className="d-flex align-items-center justify-content-center m-3 rounded">
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
