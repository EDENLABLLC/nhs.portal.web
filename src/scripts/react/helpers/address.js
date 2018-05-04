export const formatAddress = ({ zip, area, region, settlement, street, building }) =>
  [zip, area, region, settlement, street, building].filter(Boolean).join(", ");
