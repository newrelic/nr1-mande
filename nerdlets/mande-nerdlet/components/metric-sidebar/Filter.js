import React from 'react'
import startCase from 'lodash.startcase'
import map from 'lodash.map'
import { Icon, NrqlQuery, Spinner, Checkbox } from 'nr1'
import { withFacetFilterContext } from '../../../shared/context/FacetFilterContext'

class Filter extends React.Component {
  state = { expanded: false, loading: true, values: [] }

  async componentDidMount() {
    this.setState({ loading: true })
    const values = await this.loadValues()
    this.setState({ loading: false, values })
  }

  async componentDidUpdate(prevProps) {
    const {
      duration: { since },
    } = this.props
    const prevSince = prevProps.duration.since

    if (since !== prevSince) {
      this.setState({ loading: true })
      const values = await this.loadValues()
      this.setState({ loading: false, values })
    }
  }

  loadValues = async () => {
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
    if (data) values = map(data.chart[0].data, attribute).sort()

    return values
  }

  toggleValues = async () => {
    const { expanded } = this.state
    if (expanded) {
      this.setState({ loading: true, expanded: false })
    } else {
      const values = await this.loadValues()
      this.setState({ loading: false, expanded: true, values })
    }
  }

  getSelectedState = (activeAttributes, attribute, value) => {
    const found = activeAttributes.filter(
      active => active.attribute === attribute && active.value === value)
    return found.length > 0
  }

  render() {
    const { loading, expanded, values } = this.state
    const {
      attribute,
      facetContext: { filters, updateFilters },
    } = this.props
    const displayName = startCase(attribute)

    let itemValues = loading ? (
      <Spinner type={Spinner.TYPE.DOT} fillContainer />
    ) : (
      values.map((value, idx) => {
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

    return (
      <div
        className={
          expanded
            ? 'filter-category-section active'
            : 'filter-category-section'
        }
      >
        <div
          className={
            values.length === 0
              ? 'filter-category-section-header empty'
              : 'filter-category-section-header'
          }
          onClick={values.length > 0 ? this.toggleValues : () => null}
        >
          <h5 className="filter-category-section-label">
            {values.length === 0 && (
              <span className="filter-category-section-label-text empty">
                {displayName}
              </span>
            )}
            {values.length > 0 && (
              <React.Fragment>
                <span className="filter-category-section-label-text">
                  {displayName}
                </span>
                {!expanded && (
                  <Icon
                    type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__SIZE_8}
                    color="#8E9494"
                  />
                )}
                {expanded && (
                  <Icon
                    type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_TOP__SIZE_8}
                  />
                )}
              </React.Fragment>
            )}
          </h5>
        </div>
        {expanded && itemValues}
      </div>
    )
  }
}

export default withFacetFilterContext(Filter)
