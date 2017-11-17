import React, { Component } from "react";
import { subDays, format } from "date-fns";
import { ua } from "date-fns/esm/locale";
import { Plurals } from "smart-plurals";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area
} from "recharts";

const { API_ENDPOINT } = window.__CONFIG__;
const DECLARATIONS_DICT = ["декларація", "декларації", "декларацій"];

const pluralize = Plurals.getRule("uk");

export default class DeclarationsDynamicsChart extends Component {
  state = {
    data: []
  };

  async componentDidMount() {
    const params = getHistogramParams(
      document.body.clientWidth > 768 ? 30 : 15
    );

    const dynamicsRequest = await fetch(
      `${API_ENDPOINT}/reports/stats/histogram?${params}`
    );

    const { data } = await dynamicsRequest.json();

    this.setState({ data });
  }

  render() {
    const { data } = this.state;

    return (
      <ResponsiveContainer width="100%" aspect={2}>
        <AreaChart data={data}>
          <CartesianGrid stroke="#e8e8e8" />
          <XAxis
            dataKey="period_name"
            interval="preserveStartEnd"
            tickFormatter={date => format(date, "D")}
          />
          <YAxis scale="linear" />
          <Tooltip content={PeriodTooltip} cursor={{ stroke: "#4880ed" }} />
          <Area
            type="natural"
            dataKey="declarations_active_end"
            stroke="#4862ed"
            strokeWidth={2}
            fill="#4293f3"
            fillOpacity={0.9}
            dot
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}

const PeriodTooltip = ({
  payload: [
    { payload: { declarations_active_end, period_name } = {} } = {}
  ] = []
}) => (
  <div
    style={{
      backgroundColor: "#fff",
      border: "1px solid #d6d6d6",
      padding: 10
    }}
  >
    <div style={{ color: "#17184e", fontSize: 16, lineHeight: "1.5em" }}>
      {format(period_name, "D MMMM", { locale: ua })}
    </div>
    <div
      style={{
        color: "#292b37",
        fontSize: 16,
        fontWeight: 700,
        lineHeight: "1.5em"
      }}
    >
      {declarations_active_end}{" "}
      {pluralize(declarations_active_end, DECLARATIONS_DICT)}
    </div>
  </div>
);

const getHistogramParams = daysAmount => {
  const params = new URLSearchParams();

  let to_date = new Date();
  let from_date = subDays(to_date, daysAmount);

  [to_date, from_date] = [to_date, from_date].map(date =>
    format(date, "YYYY-MM-DD")
  );

  Object.entries({ to_date, from_date, interval: "DAY" }).forEach(
    ([key, value]) => params.set(key, value)
  );

  return params;
};
