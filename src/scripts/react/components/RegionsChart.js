import React, { Component } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts";

import TabControl from "./TabControl";

const { API_ENDPOINT } = window.__CONFIG__;

const REGION_NAMES = {
  "ІВАНО-ФРАНКІВСЬКА": "Івано-Франківська",
  "АВТОНОМНА РЕСПУБЛІКА КРИМ": "AР Крим",
  ВІННИЦЬКА: "Вінницька",
  ВОЛИНСЬКА: "Волинська",
  ДНІПРОПЕТРОВСЬКА: "Дніпропетровська",
  ДОНЕЦЬКА: "Донецька",
  ЖИТОМИРСЬКА: "Житомирська",
  ЗАКАРПАТСЬКА: "Закарпатська",
  ЗАПОРІЗЬКА: "Запорізька",
  КІРОВОГРАДСЬКА: "Кіровоградська",
  КИЇВСЬКА: "Київська",
  ЛУГАНСЬКА: "Луганська",
  ЛЬВІВСЬКА: "Львівська",
  "М.КИЇВ": "м. Київ",
  "М.СЕВАСТОПОЛЬ": "м. Севастополь",
  МИКОЛАЇВСЬКА: "Миколаївська",
  ОДЕСЬКА: "Одеська",
  ПОЛТАВСЬКА: "Полтавська",
  РІВНЕНСЬКА: "Рівненська",
  СУМСЬКА: "Сумська",
  ТЕРНОПІЛЬСЬКА: "Тернопільська",
  ХАРКІВСЬКА: "Харківська",
  ХЕРСОНСЬКА: "Херсонська",
  ХМЕЛЬНИЦЬКА: "Хмельницька",
  ЧЕРКАСЬКА: "Черкаська",
  ЧЕРНІВЕЦЬКА: "Чернівецька",
  ЧЕРНІГІВСЬКА: "Чернігівська"
};

const STATS_NAMES = {
  msps: "Заклади",
  doctors: "Лікарі",
  declarations: "Декларації"
};

const [DEFAULT_STATS] = Object.keys(STATS_NAMES);

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
        <ResponsiveContainer width="100%" aspect={1}>
          <BarChart
            layout="vertical"
            data={data.sort((a, b) => b.stats[stats] - a.stats[stats])}
          >
            <XAxis type="number" padding={{ left: 20, right: 30 }} hide />
            <YAxis
              type="category"
              dataKey="region.name"
              tickFormatter={name => REGION_NAMES[name]}
              width={180}
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey={`stats.${stats}`} fill="#0080f9" label={<Label />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

const Label = ({ value, x, y, width, height }) => {
  x = x + width + 10;
  y = y + height / 2;

  return (
    <text x={x} y={y} textAnchor="start">
      <tspan x={x} dy="0.355em">
        {value}
      </tspan>
    </text>
  );
};
