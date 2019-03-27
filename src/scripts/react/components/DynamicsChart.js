import React  from "react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area
} from "recharts";

import ChartTooltip from "./ChartTooltip";

const DynamicsChart = ({ data, dataKey, units }) => (
  <ResponsiveContainer width="100%" aspect={2}>
    <AreaChart data={data}>
      <CartesianGrid stroke="#e8e8e8" />
      <XAxis
        dataKey="period_name"
        height={90}
        tick={<CustomizedAxisTick/>}
      />
      <YAxis scale="linear" width={55} tick={{ fontSize: 12 }} />
      <Tooltip
        content={
          <ChartTooltip
            units={units}
            labelFormatter={l => {
              const date = new Date(l);
              const month = date.toLocaleString('uk-UA', { month: 'long' });
              return `${month.toLocaleUpperCase()} ${date.getFullYear()}`
            }}
            formatter={v => v.toLocaleString("uk-UA")}
          />
        }
        cursor={{ stroke: "#4880ed" }}
      />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke="#4862ed"
        strokeWidth={2}
        fill="#4293f3"
        fillOpacity={0.9}
        dot
      />
    </AreaChart>
  </ResponsiveContainer>
);

const CustomizedAxisTick = ({x, y, stroke, payload}) => {
    const date = new Date(payload.value);
    const month = date.toLocaleString('uk-UA', { month: 'long' });
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" fontSize="12" transform="rotate(-55)">{month}</text>
        </g>
    );
};

export default DynamicsChart;
