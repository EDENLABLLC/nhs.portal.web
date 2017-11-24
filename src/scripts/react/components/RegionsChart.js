import React, { Component } from "react";
import { Plurals } from "smart-plurals";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from "recharts";

import { REGION_NAMES } from "../constants";

import TabControl from "./TabControl";
import ChartTooltip from "./ChartTooltip";

const { API_ENDPOINT } = window.__CONFIG__;

const STATS_NAMES = {
  msps: "Заклади",
  doctors: "Лікарі",
  declarations: "Декларації"
};

const STATS_PLURALS = {
  msps: ["заклад", "заклади", "закладів"],
  doctors: ["лікар", "лікарі", "лікарів"],
  declarations: ["декларація", "декларації", "декларацій"]
};

const [DEFAULT_STATS] = Object.keys(STATS_NAMES);

const pluralize = Plurals.getRule("uk");

export default class RegionsChart extends Component {
  state = {
    data: [],
    stats: DEFAULT_STATS
  };

  async componentDidMount() {
    const regionsRequest = await fetch(`${API_ENDPOINT}/reports/stats/regions`);
    const { data } = await regionsRequest.json();

    this.setState({ data });
  }

  render() {
    const { data, stats } = this.state;

    return (
      <div>
        <TabControl
          tabs={Object.values(STATS_NAMES)}
          activeTab={Object.keys(STATS_NAMES).indexOf(stats)}
          onChange={index =>
            this.setState({ stats: Object.keys(STATS_NAMES)[index] })
          }
        />
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            layout="vertical"
            data={data.sort((a, b) => b.stats[stats] - a.stats[stats])}
            margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
          >
            <XAxis type="number" padding={{ left: 10 }} hide />
            <YAxis
              type="category"
              dataKey="region.name"
              width={130}
              interval={0}
              axisLine={{ stroke: "#d6d6d6" }}
              tickLine={false}
              tickSize={10}
              tickFormatter={name => REGION_NAMES[name]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={false}
              content={
                <ChartTooltip
                  labelFormatter={() => null}
                  units={STATS_PLURALS[stats]}
                />
              }
            />
            <Bar dataKey={`stats.${stats}`} fill="#0080f9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
