import React, { Component } from "react";
import classnames from "classnames";
import { format } from "date-fns";

import TabView from "./TabView";

const Clarifications = ({ clarifications, types, limit }) => (
  <section className="clarifications">
    <header>
      <h3>Пояснення</h3>
    </header>

    <TabView>
      {types.map(type => ({
        title: type,
        content: (
          <div key={type} className="clarifications__list">
            {clarifications
              .filter(
                ({ clarificationTypes }) =>
                  type === "Всім" ||
                  (clarificationTypes && clarificationTypes.includes(type))
              )
              .slice(0, limit)
              .map(({ id, url, title, excerpt, date }) => (
                <a key={id} className="clarifications__item" href={url}>
                  <h4>{title}</h4>
                  <time>{format(date, "dd.MM.YYYY")}</time>
                  {excerpt}
                </a>
              ))}
          </div>
        )
      }))}
    </TabView>

    {/* <section className="explain__tags">
      <div className="explain__tags-title">
          Теги:
      </div>
      <ul className="explain__tags-list">
        <li className="explain__tags-item">
          <a className="explain__tags-link" href="#">ЕЦП</a>
        </li>
        <li className="explain__tags-item">
          <a className="explain__tags-link" href="#">НСЗУ</a>
        </li>
        <li className="explain__tags-item">
          <a className="explain__tags-link" href="#">Пояснення</a>
        </li>
      </ul>
    </section> */}

    {limit && (
      <footer className="explain__footer">
        <a href="clarifications.html">Показати більше</a>
      </footer>
    )}
  </section>
);

export default Clarifications;
