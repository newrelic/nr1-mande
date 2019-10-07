import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import _ from 'lodash';
import Select from 'react-select';

import { Button, NerdGraphQuery, Spinner, Stack, StackItem } from 'nr1';

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

function replacer1(match, p1, p2, p3) {
  return p1 + capitalize(p2) + ' ' + p3;
}

export default class FacetFilter extends React.Component {
  static propTypes = {
    eventType: PropTypes.string.isRequired,
    nrqlSelect: PropTypes.string,
    accountId: PropTypes.number,
    setFacets: PropTypes.func,
    config: PropTypes.shape({
      includes: PropTypes.array,
      excludes: PropTypes.array,
      excludeDualFacets: PropTypes.bool,
    }),
  };

  static defaultProps = {
    config: {
      excludeDualFacets: false,
    },
    nrqlSelect: 'SELECT count(*)',
  };

  constructor(props) {
    super(props);
    this.state = {
      facets: null,
      selections: null,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  clickFacet(facet) {
    const { selections } = this.state;
    selections[facet] = !selections[facet];
    this.setState({ selections }, () => {
      this.facetsUpdated();
    });
  }

  handleChange(value, { action, removedValue, option }) {
    let { selections } = this.state;
    if (action === 'remove-value') {
      selections[removedValue.value] = !selections[removedValue.value];
    } else if (action === 'select-option') {
      selections[option.value] = !selections[option.value];
    } else if (action === 'clear') {
      selections = selections.map((selection, index) => {
        selections[index] = false;
      });
    }
    this.setState({ selections }, () => {
      this.facetsUpdated();
    });
  }

  /**
   * Build an array of selected facets and pass them to the callback
   */
  facetsUpdated() {
    const { facets, selections } = this.state;
    let filteredFacets = facets.filter(facet => {
      return selections[facet.valueAttr];
    });

    this.props.setFacets(filteredFacets);
  }

  componentDidMount() {
    this.buildFacets();
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.eventType && nextProps.eventType != this.props.eventType) {
      this.setState({ facets: null, selections: null }, () => {
        this.buildFacets();
      });
    }
    return true;
  }

  buildFacets() {
    const { accountId, duration, eventType, nrqlSelect } = this.props;
    const durationInMinutes =
      duration / 1000 / 60 < 24 * 60 ? 24 * 60 : duration / 1000 / 60;
    const query = gql`{
            actor {
                account(id: ${accountId}) {
                    nrql(query: "${nrqlSelect} FROM ${eventType} SINCE ${durationInMinutes} MINUTES AGO") {
                        results
                        suggestedFacets {
                            attributes
                        }
                    }
                }
            }
        }`;

    let facets = [];
    const selections = [];
    const { excludeDualFacets, excludes, includes } = this.props.config;

    if (includes) {
      includes.forEach(include => {
        facets.push({
          valueAttr: include,
          title: include.replace(/(^|[^a-z])([a-z]+)([A-Z])/, replacer1),
          limit: 5,
        });
        selections[include] = true;
      });
    }

    NerdGraphQuery.query({ query }).then(res => {
      const { loading, data, errors } = res;
      const suggestedFacets = _.get(
        data,
        'actor.account.nrql.suggestedFacets',
        []
      );

      suggestedFacets.forEach(suggestedFacet => {
        let addFacet = true;
        const valueAttr = suggestedFacet.attributes[0];

        if (excludeDualFacets && valueAttr.indexOf(',') < 0) {
          addFacet = false;
        }

        if (excludes) {
          addFacet = excludes.find(exclude => exclude == valueAttr) == null;
        }

        if (
          addFacet &&
          facets.find(facet => facet.valueAttr == valueAttr) == null
        ) {
          facets.push({
            valueAttr,
            title: valueAttr.replace(/(^|[^a-z])([a-z]+)([A-Z])/, replacer1),
            limit: 5,
          });
          selections[valueAttr] = true;
        }
      });
      facets = facets.sort();

      this.setState({ facets, selections }, () => {
        this.facetsUpdated();
      });
    });
  }

  render() {
    const { facets, selections } = this.state;

    if (!facets) {
      return (
        <div>
          <Spinner />
        </div>
      );
    } else {
      let options = facets.map(facet => {
        return { value: facet.valueAttr, label: facet.title };
      });

      return (
        <div className="facetFilterContainer">
          <h4 className="facetFilterLabel">Selected Facets</h4>
          <Select
            options={options}
            className="facetFilter"
            classNamePrefix="facetFilter"
            isMulti
            onChange={this.handleChange}
            defaultValue={options}
          />
        </div>
      );
    }
  }
}
