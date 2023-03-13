import React, { PureComponent } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// This Component plots the Scatter plot of forks vs stars and a threshold is set for both the parameters

const ScatterChartComponent = (props: any) => {
  const threshold_x = 300;
  const threshold_y = 300;

  // This function maps the data from the props to the format required by the Scatter Chart Component
  // This also sets the color of point based on the no. of stars and forks
  const data = props.data.community.map((item: any) => {
    return {
      x: parseInt(item.forks),
      y: parseInt(item.stars),
      color:
        parseInt(item.forks) < threshold_x && parseInt(item.stars) < threshold_y
          ? "red"
          : "green",
    };
  });

  console.log(data);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 5,
        }}
      >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Forks" unit="" />
        <YAxis type="number" dataKey="y" name="Stars" unit="" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="A school" data={data}>
          {data.map((point: any, index: number) => (
            <Cell key={`cell-${index}`} fill={point.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChartComponent;
