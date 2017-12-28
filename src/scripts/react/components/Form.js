import React from "react";

const Form = ({ title, children, ...props }) => (
  <form className="form" {...props}>
    <h1 className="form__title">{title}</h1>
    {children}
  </form>
);

export default Form;

export const FormRow = props => <div className="form__row" {...props} />;

export const FormCol = props => <div className="form__col" {...props} />;
