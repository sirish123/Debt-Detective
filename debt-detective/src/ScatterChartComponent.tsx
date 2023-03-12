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

  const data = props.data.community.map((item: any) => {
    return {
      x: parseInt(item.forks),
      y: parseInt(item.stars)
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
            left: 5
          }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Forks" unit="" />
          <YAxis type="number" dataKey="y" name="Stars" unit="" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="A school" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
  );
};

export default ScatterChartComponent;
