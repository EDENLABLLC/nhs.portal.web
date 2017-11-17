import React from "react";
import Gamburger from "./Gamburger";
import classnames from "classnames";

const list = [
  {
    link: "/about.html",
    title: "Про нас"
  },
  {
    link: "/join.html",
    title: "Долучитися"
  },
  {
    link: "/map.html",
    title: "Мапа"
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

export default class Header extends React.Component {
  state = {
    open: false
  };
  componentWillUnmout() {
    this.setState(() => ({
      open: false
    }));
  }

  render() {
    return (
      <div className="header__in">
        <header className="header__head">
          <div className="header__logo">
            <a href="/">
              <img src="images/logo.svg" alt="NHS Logo" />
            </a>
          </div>
          <nav className={classnames("nav", this.state.open && "open")}>
            <ul>
              {list.map(({ link, title }) => (
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
            onToggle={() =>
              this.setState(() => ({
                open: !this.state.open
              }))
            }
          />
        </header>
        <article className="header__main">
          <h2>Піклуємося про ваше здоров’я!</h2>
          <h1>“eHealth” – Національна електронна система охорони здоров’я</h1>
        </article>
        <footer className="header__footer">
          <a className="header__main-link" href="about.html">
            докладніше
            <i className="icon icon_name_arrow-right" />
          </a>
        </footer>
      </div>
    );
  }
}
