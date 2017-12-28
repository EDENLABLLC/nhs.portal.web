import React from "react";

const InputField = ({ label, placeholder, name, value, onChange }) => (
  <div className="field">
    <label className="field__label" htmlFor={name}>
      {label}
    </label>
    <input
      className="field__input"
      type="text"
      placeholder={placeholder}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default InputField;
