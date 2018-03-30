import React from "react";
import { chunk } from "lodash";
import classnames from "classnames";
import Carousel from "nuka-carousel";

const Documents = ({ documents }) => (
  <section className="docs">
    <header className="docs__header">
      <h3>Документи</h3>
    </header>
    <article className="docs__main">
      <Carousel
        decorators={[
          {
            component: Markers,
            position: "BottomCenter",
            style: { position: "relative" }
          }
        ]}
        cellSpacing={20}
        swiping
      >
        {chunk(documents, 6).map((documents, index) => (
          <ul key={index} className="docs__list">
            {documents.map(({ id, url, type, header, title }) => (
              <li key={id} className="docs__item">
                <a target="_blank" href={url}>
                  <div className="docs__item-icon">
                    <i className="icon icon_name_doc" />
                    {type}
                  </div>
                  <div>
                    {header && <div className="docs__attention">{header}</div>}
                    <div dangerouslySetInnerHTML={{ __html: title }} />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ))}
      </Carousel>
    </article>
  </section>
);

const Markers = ({ slideCount, currentSlide, goToSlide }) => (
  <ul className="slider__markers">
    {Array.from({ length: slideCount }, (_, i) => i).map(slide => (
      <li
        key={slide}
        className={classnames("slider__marker", {
          slider__marker_active: slide === currentSlide
        })}
        onClick={() => goToSlide(slide)}
      />
    ))}
  </ul>
);

export default Documents;
