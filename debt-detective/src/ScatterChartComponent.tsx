import React, { PureComponent } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const ScatterChartComponent = (props: any) => {

  // Map elements from props.data.community to an array of objects where x is the number of forks and y is the number of stars
  const data = props.data.community.map((item: any) => {
    return {
      x: item.forks,
      y: item.stars
    };
  });


  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }}
      >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Forks" unit="" />
        <YAxis type="number" dataKey="y" name="Stars" unit="" />
        <Tooltip cursor={{ strokeDasharray: "5 5" }} />
        <Scatter name="Community Activeness" data={data} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChartComponent;
