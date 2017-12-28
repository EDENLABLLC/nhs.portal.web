import React from "react";

const TableView = ({
  data,
  header,
  renderRow,
  rowKeyExtractor = (item, index) => item.key,
  columnKeyExtractor = (name, index) => name
}) => (
  <table className="table">
    <TableHeader header={header} columnKeyExtractor={columnKeyExtractor} />
    <TableBody
      columns={Object.keys(header)}
      data={data}
      renderRow={renderRow}
      rowKeyExtractor={rowKeyExtractor}
      columnKeyExtractor={columnKeyExtractor}
    />
  </table>
);

export default TableView;

const TableHeader = ({ header, columnKeyExtractor }) => (
  <thead className="table__header">
    <tr className="table__row">
      {Object.entries(header).map(([name, content], index) => (
        <th key={columnKeyExtractor(name, index)} className="table__cell">
          {content}
        </th>
      ))}
    </tr>
  </thead>
);

const TableBody = ({
  columns,
  data,
  renderRow,
  rowKeyExtractor,
  columnKeyExtractor
}) => (
  <tbody className="table__body">
    {data.map((item, index) => {
      const row = renderRow(item, index);

      return (
        <tr key={rowKeyExtractor(item, index)} className="table__row">
          {columns.map((name, index) => (
            <td key={columnKeyExtractor(name, index)} className="table__cell">
              {row[name]}
            </td>
          ))}
        </tr>
      );
    })}
  </tbody>
);
