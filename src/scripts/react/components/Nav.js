import React, { Component } from "react";
import classnames from "classnames";

import Gamburger from "./Gamburger";

const NAV_ITEMS = [
  {
    link: "/about.html",
    title: "Про нас"
  },
  {
    link: "/join.html",
    title: "Долучитися"
  },
  {
    link: "/divisions.html",
    title: "Пошук"
  },
  {
    link: "/#statistic",
    title: "Статистика"
  },
  {
    link: "/clarifications.html",
    title: "Пояснення"
  },
  {
    link: "/#documents",
    title: "Документи"
  },
  {
    link: "/#contacts",
    title: "Контакти"
  }
];

export default class Nav extends Component {
  state = {
    open: false
  };

  componentWillUnmout() {
    this.setState(() => ({ open: false }));
  }

  render() {
    return (
      <header className="header__head">
        <div className="header__logo">
          <a href="/">
            <img src="/images/logo.svg" alt="NHS Logo" />
          </a>
        </div>
        <nav className={classnames("nav", this.state.open && "open")}>
          <ul>
            {NAV_ITEMS.map(({ link, title }) => (
              <li key={link}>
                <a
                  href={`${link}`}
                  className="nav__link"
                  onClick={() => this.setState({ open: false })}
                >
                  {title}
                </a>
              </li>
            ))}
            <li>
              <a
                className="nav__link"
                target="_blank"
                href="https://www.facebook.com/E-Health-323399904773248"
              >
                <i className="icon icon_name_fb" />
              </a>
            </li>
            <li>
              <a
                className="nav__link"
                target="_blank"
                href="https://twitter.com/eHealthUa"
              >
                <i className="icon icon_name_tw" />
              </a>
            </li>
          </ul>
        </nav>
        <Gamburger
          active={this.state.open}
          onToggle={() => this.setState(({ open }) => ({ open: !open }))}
        />
      </header>
    );
  }
}
