import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

import { createUrl, stringifySearchParams } from "../helpers/url";
import { formatAddress } from "../helpers/address";

import ArrowLink from "./ArrowLink";
import DefinitionListView from "./DefinitionListView";

const { API_ENDPOINT } = window.__CONFIG__;

export default class DivisionDetails extends Component {
  state = {
    isLoading: true,
    division: {}
  };

  componentDidMount() {
    this.fetchDivision();
  }

  render() {
    const {
      location: { state: { prevLocation } = {}, ...location }
    } = this.props;

    const {
      isLoading,
      division: { legal_entity = {}, ...division }
    } = this.state;

    return !isLoading ? (
      <div className="main__in">
        <h3>Відділення</h3>

        <h5>{division.name}</h5>
        <DefinitionListView
          data={division}
          terms={{
            address: "Адреса",
            contacts: "Контакти"
          }}
          renderDetails={({
            id,
            type,
            name,
            addresses: [address],
            coordinates: { latitude: lat, longitude: lng },
            contacts: { phones, email }
          }) => ({
            address: (
              <Fragment>
                <p>{formatAddress(address)}</p>
                {lat && lng ? (
                  <Link
                    className="link bold"
                    to={{
                      pathname: "/map",
                      search: stringifySearchParams({
                        active: id,
                        type,
                        lat,
                        lng,
                        zoom: 15
                      }),
                      state: { prevLocation: location }
                    }}
                  >
                    показати на мапі
                  </Link>
                ) : null}
              </Fragment>
            ),
            contacts: (
              <Fragment>
                {phones.map(({ number }) => <div key={number}>{number}</div>)}
                <a className="link" href={`mailto:${email}`}>
                  {email}
                </a>
              </Fragment>
            )
          })}
        />

        <h5>{legal_entity.name}</h5>
        <DefinitionListView
          data={legal_entity}
          terms={{
            edrpou: "ЄДРПОУ",
            address: "Адреса",
            phones: "Контакти",
            owner: "Керівник"
          }}
          renderDetails={({ edrpou, addresses: [address], phones, owner }) => ({
            edrpou,
            address: formatAddress(address),
            phones: phones.map(({ number }) => (
              <div key={number}>{number}</div>
            )),
            owner: formatFullName(owner.party)
          })}
        />

        {prevLocation && (
          <ArrowLink
            to={prevLocation}
            title="Назад до результатів пошуку"
            backwards
          />
        )}
      </div>
    ) : null;
  }

  async fetchDivision() {
    const { match: { params } } = this.props;

    const divisionsResponse = await fetch(
      createUrl(`${API_ENDPOINT}/reports/stats/divisions`, params)
    );

    const { data: [division] } = await divisionsResponse.json();

    this.setState({ division, isLoading: false });
  }
}

const formatFullName = ({ first_name, second_name, last_name }) =>
  [last_name, first_name, second_name].join(" ");
