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
    const { location: { state: { prevLocation } = {} } } = this.props;
    const { isLoading, division } = this.state;

    return !isLoading ? (
      <div className="main__in">
        <ArrowLink href="/" title="Назад на головну" backwards />
        <h3>Учасники</h3>
        <h5>{division.name}</h5>
        <DefinitionListView
          data={division}
          terms={{
            edrpou: "ЄДРПОУ",
            address: "Адреса",
            contacts: "Контакти",
            ownerFullName: "Керівник",
            legalEntityName: "Медзаклад",
            legalEntityAddress: "Адреса медзакладу",
            legalEntityContacts: "Контакти медзакладу"
          }}
          renderDetails={({
            id,
            type,
            name,
            addresses: [address],
            coordinates: { latitude: lat, longitude: lng },
            contacts: { phones, email },
            legal_entity: {
              edrpou,
              owner,
              name: legalEntityName,
              addresses: [legalEntityAddress],
              phones: legalEntityPhones
            }
          }) => ({
            edrpou,
            address: (
              <Fragment>
                <p>{formatAddress(address)}</p>
                <Link
                  className="link bold"
                  to={{
                    pathname: "/map",
                    search: stringifySearchParams({
                      activeItemId: id,
                      type,
                      lat,
                      lng,
                      zoom: 15
                    })
                  }}
                >
                  показати на мапі
                </Link>
              </Fragment>
            ),
            contacts: (
              <Fragment>
                {phones.map(({ number }) => <div key={number}>{number}</div>)}
                <a className="link" href={`mailto:${email}`}>
                  {email}
                </a>
              </Fragment>
            ),
            ownerFullName: formatFullName(owner.party),
            legalEntityName,
            legalEntityAddress: formatAddress(legalEntityAddress),
            legalEntityContacts: (
              <Fragment>
                {legalEntityPhones.map(({ number }) => (
                  <div key={number}>{number}</div>
                ))}
              </Fragment>
            )
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
