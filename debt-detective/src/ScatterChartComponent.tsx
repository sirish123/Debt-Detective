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

const ScatterChartComponent = (props: any) => {
  const threshold_x = 300;
  const threshold_y = 300;

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
