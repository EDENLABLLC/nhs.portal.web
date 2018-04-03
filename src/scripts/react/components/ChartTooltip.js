import React from "react";
import { Plurals } from "smart-plurals";

const pluralize = Plurals.getRule("uk");

const ChartTooltip = ({
  active,
  label,
  payload,
  labelFormatter = s => s,
  formatter = s => s,
  units
}) => {
  if (!active) return null;

  let [{ value }] = payload;
  label = labelFormatter(label);
  value = formatter(value);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #d6d6d6",
        padding: 10
      }}
    >
      {label && (
        <div style={{ color: "#17184e", fontSize: 16, lineHeight: "1.5em" }}>
          {label}
        </div>
      )}
      <div
        style={{
          color: "#292b37",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: "1.5em"
        }}
      >
        {value} {units && pluralize(value, units)}
      </div>
    </div>
  );
};

export default ChartTooltip;
