import React, { Component } from "react";
import classnames from "classnames";
import { format } from "date-fns";
import Carousel from "nuka-carousel";

class Clarifications extends Component {
  state = {
    activeTypeIndex: 0
  };

  tabs = {};

  render() {
    const { clarifications, types } = this.props;
    const { activeTypeIndex } = this.state;

    return (
      <section class="explain">
        <header class="explain__header">
          <h3>Пояснення</h3>
        </header>
        <article class="explain__main">
          <header className="tabs__header">
            <ul className="tabs__nav">
              {types.map((type, index) => (
                <li
                  key={type}
                  ref={e => (this.tabs[index] = e)}
                  className={classnames("tabs__nav-item", {
                    "tabs__nav-item_active": activeTypeIndex === index,
                    "tabs__nav-item_marker": activeTypeIndex === index
                  })}
                  onClick={() => this.changeType(index, true)}
                >
                  {type}
                </li>
              ))}
            </ul>
          </header>
          <Carousel
            ref={e => (this.carousel = e)}
            className="tabs__main"
            afterSlide={this.changeType}
            decorators={null}
            cellSpacing={20}
            swiping
          >
            {types.map(type => (
              <div key={type} className="explain__list">
                {clarifications
                  .filter(
                    ({ clarificationTypes }) =>
                      type === "Всім" ||
                      (clarificationTypes && clarificationTypes.includes(type))
                  )
                  .slice(0, 4)
                  .map(({ id, url, title, excerpt, date }) => (
                    <a key={id} className="explain__item" href={url}>
                      <h4>{title}</h4>
                      <time>{format(date, "DD-MM-YYYY")}</time>
                      {excerpt}
                    </a>
                  ))}
              </div>
            ))}
          </Carousel>
        </article>
        {/* <section class="explain__tags">
              <div class="explain__tags-title">
                  Теги:
              </div>
              <ul class="explain__tags-list">
                  <li class="explain__tags-item">
                      <a class="explain__tags-link" href="#">ЕЦП</a>
                  </li>
                  <li class="explain__tags-item">
                      <a class="explain__tags-link" href="#">НСЗУ</a>
                  </li>
                  <li class="explain__tags-item">
                      <a class="explain__tags-link" href="#">Пояснення</a>
                  </li>
              </ul>
          </section> */}
        <footer class="explain__footer">
          <a href="clarifications.html">Показати більше</a>
        </footer>
      </section>
    );
  }

  changeType = (index, updateCarousel) => {
    const tab = this.tabs[index];
    const { types } = this.props;

    this.setState({ activeTypeIndex: index });
    tab.scrollIntoView({ behavior: "smooth" });
    if (updateCarousel) this.carousel.goToSlide(index);
  };
}

export default Clarifications;
