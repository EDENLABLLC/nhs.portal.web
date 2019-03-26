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
        interval="preserveStartEnd"
        tickFormatter={date => format(date, "M")}
        tick={{ fontSize: 12 }}
      />
      <YAxis scale="linear" width={80} tick={{ fontSize: 12 }} />
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

export default DynamicsChart;
