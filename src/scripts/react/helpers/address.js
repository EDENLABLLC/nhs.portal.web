export const formatAddress = ({ zip, settlement, street, building }) =>
  [zip, settlement, street, building].filter(Boolean).join(", ");
