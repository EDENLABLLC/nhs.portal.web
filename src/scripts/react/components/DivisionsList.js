import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

import { createUrl, stringifySearchParams } from "../helpers/url";
import { formatAddress } from "../helpers/address";

import withHistoryState from "./withHistoryState";
import ArrowLink from "./ArrowLink";
import Form, { FormRow, FormCol } from "./Form";
import InputField from "./InputField";
import SelectField from "./SelectField";
import TableView from "./TableView";
import Pagination from "./Pagination";

const { API_ENDPOINT } = window.__CONFIG__;

@withHistoryState
export default class DivisionsList extends Component {
  state = {
    divisions: [],
    paging: {}
  };

  componentDidMount() {
    this.fetchDivisions();
  }

  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.fetchDivisions();
    }
  }

  render() {
    const { location, query, setQuery } = this.props;
    const { divisions, paging } = this.state;

    return (
      <div className="main__in">
        <ArrowLink href="/" title="Назад на головну" backwards />
        <h3>Учасники</h3>
        <ArrowLink
          to={{
            pathname: "/map",
            search: stringifySearchParams({ name: query.name })
          }}
          title="Шукати на мапі"
        />
        <DivisionSearchForm value={query} onChange={setQuery} />
        <TableView
          data={divisions}
          header={{
            name: (
              <Fragment>
                Назва<br />
                відділення
              </Fragment>
            ),
            edrpou: "ЄДРПОУ",
            address: "Адреса",
            contacts: "Контакти",
            legalEntityName: "Медзаклад",
            action: "Дія"
          }}
          renderRow={({
            id,
            type,
            name,
            legal_entity: { name: legalEntityName, edrpou },
            addresses: [address],
            contacts: { email, phones },
            coordinates: { latitude: lat, longitude: lng }
          }) => ({
            name: (
              <Link
                to={{ pathname: `/${id}`, state: { prevLocation: location } }}
                className="link bold"
              >
                {name}
              </Link>
            ),
            edrpou,
            address: formatAddress(address),
            contacts: (
              <Fragment>
                {phones.map(({ number }) => <div key={number}>{number}</div>)}
                <a href={`mailto:${email}`} className="link">
                  {email}
                </a>
              </Fragment>
            ),
            legalEntityName,
            action: (
              <Link
                to={{
                  pathname: "/map",
                  search: stringifySearchParams({
                    active: id,
                    type,
                    lat,
                    lng,
                    zoom: 15
                  })
                }}
                className="link bold"
              >
                показати на мапі
              </Link>
            )
          })}
          rowKeyExtractor={({ id }) => id}
        />
        <Pagination totalPages={paging.total_pages} />
      </div>
    );
  }

  async fetchDivisions() {
    if (this.state.isLoading) return;

    this.setState({ isLoading: true });

    const divisionsResponse = await fetch(
      createUrl(`${API_ENDPOINT}/reports/stats/divisions`, {
        page: 1,
        page_size: 50,
        ...this.props.query
      })
    );

    const { data, paging } = await divisionsResponse.json();

    this.setState(({ divisions }) => ({
      isLoading: false,
      divisions: data,
      paging
    }));
  }
}

class DivisionSearchForm extends Component {
  state = {
    settlement_name: this.props.value.settlement || "",
    settlements: []
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.settlement_name !== prevState.settlement_name) {
      this.fetchSettlements();
    }
  }

  render() {
    const { value: { name, legal_entity_edrpou, settlement } } = this.props;

    const { settlement_name, settlements } = this.state;

    return (
      <Form title="Шукати відділення">
        <FormRow>
          <FormCol>
            <InputField
              label="Назва"
              placeholder="Введіть назву"
              name="name"
              value={name}
              onChange={event =>
                this.handleChange({ name: event.target.value })
              }
            />
          </FormCol>
          <FormCol>
            <InputField
              label="ЄДРПОУ"
              placeholder="Введіть ЄДРПОУ"
              name="legal_entity_edrpou"
              value={legal_entity_edrpou}
              onChange={event =>
                this.handleChange({
                  legal_entity_edrpou: event.target.value
                })
              }
            />
          </FormCol>
          <FormCol>
            <SelectField
              label="Населений пункт"
              placeholder="Введіть населений пункт"
              items={settlements}
              itemToString={item => (item == null ? "" : item.name)}
              selectedItemChanged={(prevItem, item) =>
                (prevItem == null ? undefined : prevItem.name) !==
                (item == null ? undefined : item.name)
              }
              filterItems={({ name }, inputValue) =>
                name.includes(inputValue.toUpperCase())
              }
              renderItem={({ name, district, region }) => (
                <div>
                  <div>{name}</div>
                  <small>{[district, region].filter(Boolean).join(", ")}</small>
                </div>
              )}
              itemKeyExtractor={({ id }) => id}
              inputValue={settlement_name}
              onInputValueChange={settlement_name =>
                this.setState({ settlement_name })
              }
              selectedItem={settlement ? { name: settlement } : null}
              onChange={item => {
                const { name, district, region } = item || {};

                this.handleChange({
                  settlement: name,
                  region: district,
                  area: region
                });
              }}
            />
          </FormCol>
        </FormRow>
      </Form>
    );
  }

  handleChange(changes) {
    const { value, onChange } = this.props;

    onChange({ ...value, ...changes });
  }

  async fetchSettlements({ page = 1, page_size = 10 } = {}) {
    const { settlement_name } = this.state;

    if (settlement_name.length < 2) {
      this.setState({ settlements: [] });
    } else {
      const settlementsResponse = await fetch(
        createUrl(`${API_ENDPOINT}/api/uaddresses/search/settlements`, {
          name: settlement_name,
          page,
          page_size
        })
      );

      const { data } = await settlementsResponse.json();

      this.setState({ settlements: data });
    }
  }
}
