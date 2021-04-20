import React from 'react'
import startCase from 'lodash.startcase'
import map from 'lodash.map'
import { Icon, NrqlQuery, Spinner, Checkbox, TextField } from 'nr1'
import { withFacetFilterContext } from '../../../shared/context/FacetFilterContext'

class Filter extends React.Component {
  state = {
    expanded: false,
    loading: true,
    searchText: '',
    searchRE: new RegExp(),
    lastLoad: null,
    values: [],
    displayValues: [],
  }

  async componentDidUpdate(prevProps) {
    const {
      duration: { since },
    } = this.props
    const prevSince = prevProps.duration.since
    const { lastLoad } = this.state

    if (since !== prevSince && lastLoad) this.loadValues(true)
  }

  loadValues = async force => {
    const {
      props: {
        timeRange: { duration },
      },
      state: { lastLoad },
    } = this
    let shouldQuery = !!force

    if (!lastLoad) shouldQuery = true
    if (duration && Date.now() - lastLoad > duration) shouldQuery = true

    if (shouldQuery) this.setState({ loading: true }, this.queryValues)
  }

  queryValues = async () => {
    const {
      accountId,
      attribute,
      eventTypes,
      duration: { since },
    } = this.props

    const query = `SELECT uniques(${attribute}) FROM ${eventTypes} ${since}`

    const { data, error } = await NrqlQuery.query({ accountId, query })
    if (error) console.error(error)

    let values = [] // if we don't get any values back, state will reset to blank
    if (data) values = map(data[0].data, attribute).sort()

    this.setState({
      loading: false,
      lastLoad: Date.now(),
      values,
      displayValues: values,
    })
  }

  toggleValues = async () => {
    const { expanded } = this.state
    if (expanded) {
      this.setState({ expanded: false })
    } else {
      this.setState({ expanded: true }, this.loadValues)
    }
  }

  getSelectedState = (activeAttributes, attribute, value) => {
    const found = activeAttributes.filter(
      active => active.attribute === attribute && active.value === value
    )
    return found.length > 0
  }

  searchTextHandler = evt => {
    const searchText = evt.target.value
    let { searchRE, displayValues, values } = this.state

    try {
      const trimmedSearchText = searchText.trim()
      searchRE = new RegExp(trimmedSearchText, 'ig')
      displayValues =
        trimmedSearchText.length > 0
          ? values.filter(value => searchRE.test(value))
          : values
    } catch (e) {
      console.error(`Unable to search for filter values. ${e.message}`)
    }

    this.setState({ searchText, searchRE, displayValues })
  }

  render() {
    const { loading, expanded, searchText, displayValues } = this.state
    const {
      attribute,
      facetContext: { filters, updateFilters },
    } = this.props
    const displayName = startCase(attribute)

    let itemValues = loading ? (
      <Spinner type={Spinner.TYPE.DOT} fillContainer />
    ) : (
      displayValues.map((value, idx) => {
        const selected = this.getSelectedState(filters, attribute, value)
        return (
          <div key={value + idx} className="filter-attribute-item">
            <span className="filter-attribute-checkbox">
              <Checkbox
                checked={selected}
                className="filter-attribute-checkbox-input"
                onChange={() => updateFilters(attribute, value)}
              />
            </span>
            <span
              onClick={() => updateFilters(attribute, value)}
              className={
                selected
                  ? 'filter-attribute-value checked'
                  : 'filter-attribute-value'
              }
            >
              {value}
            </span>
          </div>
        )
      })
    )

    const chevronIcon = expanded ? (
      <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_TOP__SIZE_8} />
    ) : (
      <Icon
        type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__SIZE_8}
        color="#8E9494"
      />
    )

    return (
      <div
        className={
          expanded
            ? 'filter-category-section active'
            : 'filter-category-section'
        }
      >
        <div
          className="filter-category-section-header"
          onClick={this.toggleValues}
        >
          <h5 className="filter-category-section-label">
            <React.Fragment>
              <span className="filter-category-section-label-text">
                {displayName}
              </span>
              {chevronIcon}
            </React.Fragment>
          </h5>
        </div>
        {expanded && (
          <>
            <TextField
              type={TextField.TYPE.SEARCH}
              placeholder="Search"
              className="filter-search"
              value={searchText}
              onChange={this.searchTextHandler}
            />
            <div className="filter-values-list">{itemValues}</div>
          </>
        )}
      </div>
    )
  }
}

export default withFacetFilterContext(Filter)
