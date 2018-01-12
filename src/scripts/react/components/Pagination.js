import React, { Component } from "react";
import classnames from "classnames";
import { withRouter, Link } from "react-router-dom";

import { parseSearchParams, stringifySearchParams } from "../helpers/url";

const TRUNCATE_LENGTH = 1;

@withRouter
export default class Pagination extends Component {
  static defaultProps = {
    totalPages: 1,
    marginPages: 1,
    pageRange: 5,
    rangeOverlap: 1
  };

  render() {
    const { totalPages } = this.props;

    if (totalPages <= 1) return null;

    return (
      <ul className="pagination">
        <PageDirection
          type="prev"
          page={this.currentPage - 1}
          url={this.getPageUrl(this.currentPage - 1)}
          hide={this.currentPage === 1}
        />
        {this.leftPages.map(page => (
          <Page
            key={page}
            page={page}
            url={this.getPageUrl(page)}
            current={page === this.currentPage}
          />
        ))}
        {this.shouldRangeBeTruncated &&
          (this.isCurrentPageInLeftRange || <TruncatedDelimiter />)}
        {this.middlePages.map(page => (
          <Page
            key={page}
            page={page}
            url={this.getPageUrl(page)}
            current={page === this.currentPage}
          />
        ))}
        {this.shouldRangeBeTruncated &&
          (this.isCurrentPageInRightRange || <TruncatedDelimiter />)}
        {this.rightPages.map(page => (
          <Page
            key={page}
            page={page}
            url={this.getPageUrl(page)}
            current={page === this.currentPage}
          />
        ))}
        <PageDirection
          type="next"
          page={this.currentPage + 1}
          url={this.getPageUrl(this.currentPage + 1)}
          hide={this.currentPage === totalPages}
        />
      </ul>
    );
  }

  get currentPage() {
    const { page } = parseSearchParams(this.props.location.search);

    return parseInt(page, 10) || 1;
  }

  get leftPages() {
    const { marginPages, totalPages } = this.props;

    const length = Math.min(marginPages, totalPages);

    return valuesFromRange(length);
  }

  get middlePages() {
    const { pageRange, marginPages, totalPages } = this.props;

    if (this.shouldRangeBeTruncated) {
      if (this.isCurrentPageInLeftRange) {
        // 1 2 | 3 4 5 (6) _ | 14 15
        return valuesFromRange(pageRange - TRUNCATE_LENGTH, marginPages);
      } else if (this.isCurrentPageInRightRange) {
        // 1 2 _ (10) 11 12 13 | 14 15
        return valuesFromRange(
          pageRange - TRUNCATE_LENGTH,
          this.rightRange.begin
        );
      } else {
        // 1 2 | _ 7 (8) 9 _ | 14 15
        const length = pageRange - 2 * TRUNCATE_LENGTH;

        return valuesFromRange(length, this.currentPage - Math.ceil(length / 2));
      }
    } else {
      // 1 (2) || 3
      // 1 (2) || 3 4
      // 1 (2) | 3 | 4 5
      // 1 (2) | 3 4 5 6 7 | 8 9

      const length = Math.max(totalPages - marginPages * 2, 0);

      return valuesFromRange(length, marginPages);
    }
  }

  get rightPages() {
    const { totalPages, marginPages } = this.props;

    const restPages = Math.max(totalPages - marginPages, 0);
    const length = Math.min(marginPages, restPages);

    return valuesFromRange(length, restPages);
  }

  get shouldRangeBeTruncated() {
    const { marginPages, pageRange, totalPages } = this.props;

    const maxPagesLength = marginPages * 2 + pageRange;

    return maxPagesLength < totalPages;
  }

  get isCurrentPageInLeftRange() {
    return (
      this.currentPage <= this.leftRange.end - this.props.rangeOverlap
    );
  }

  get isCurrentPageInRightRange() {
    return (
      this.currentPage > this.rightRange.begin + this.props.rangeOverlap
    );
  }

  get leftRange() {
    const { marginPages, pageRange } = this.props;

    return {
      begin: 0,
      end: marginPages + pageRange - TRUNCATE_LENGTH
    };
  }

  get rightRange() {
    const { totalPages, marginPages, pageRange } = this.props;

    return {
      begin: totalPages - (marginPages + pageRange - TRUNCATE_LENGTH),
      end: totalPages
    };
  }

  getPageUrl(page) {
    const { location } = this.props;
    const query = parseSearchParams(location.search);
    const search = stringifySearchParams({ ...query, page });

    return { ...location, search };
  }
}

const valuesFromRange = (length, offset = 0) =>
  Array.from({ length }, (_, index) => offset + index + 1);

const PageDirection = ({ type, page, url, hide }) => (
  <li className={classnames("pagination__direction", { "pagination__direction--hidden": hide })}>
    <Link to={url} data-page={page}>
      <i
        className={classnames(
          "icon",
          `icon_name_arrow-${type === "prev" ? "left" : "right"}`
        )}
      />
    </Link>
  </li>
);

const Page = ({ page, url, current }) => (
  <li className={classnames("pagination__page", { "pagination__page--current": current })}>
    <Link to={url} data-page={page}>
      {page}
    </Link>
  </li>
);

const TruncatedDelimiter = () => (
  <li className="pagination__delimiter">...</li>
);
