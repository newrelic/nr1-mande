import React from 'react'
import { startCase, map } from 'lodash'
import { Icon, NrqlQuery, Spinner, Checkbox } from 'nr1'
import AttributeValue from './AttributeValue'

export default class FilterAttribute extends React.Component {
  state = { expanded: false, loading: true, values: [] }

  loadValues = async () => {
    const {
      accountId,
      attribute,
      eventTypes,
      duration: { since },
    } = this.props

    const query = `SELECT uniques(${attribute}) FROM ${eventTypes} ${since}`
    const { data } = await NrqlQuery.query({ accountId, query })

    let values = [] // if we don't get any values back, state will reset to blank
    if (data) values = map(data.chart[0].data, attribute).sort()

    return values
  }

  toggleValues = async () => {
    const { expanded } = this.state
    if (expanded) {
      this.setState({ loading: true, expanded: false, values: [] })
    } else {
      const values = await this.loadValues()
      this.setState({ loading: false, expanded: true, values })
    }
  }

  getSelectedState = (activeAttributes, attribute, value) => {
    const found = activeAttributes.filter(
      active => active.attribute === attribute && active.value === value
    )
    return found.length > 0
  }

  onCheckboxChange = () => {
    const { attribute, faceted, facetToggle } = this.props
    facetToggle(attribute, !faceted)
  }

  render() {
    const { loading, expanded, values } = this.state
    const { attribute, attributeToggle, activeAttributes, faceted } = this.props
    const displayName = startCase(attribute)

    let valueItems = loading ? (
      <Spinner type={Spinner.TYPE.DOT} fillContainer />
    ) : (
      values.map((value, idx) => {
        return (
          <AttributeValue
            key={value + idx}
            selected={this.getSelectedState(activeAttributes, attribute, value)}
            attribute={attribute}
            value={value}
            attributeToggle={attributeToggle}
          />
        )
      })
    )

    return (
      <div className="filter-attribute">
        <div
          className={
            expanded
              ? 'filter-attribute-titlebar expand'
              : 'filter-attribute-titlebar'
          }
        >
          <span className="filter-attribute-title">
            <span
              className="filter-attribute-title-name"
              onClick={this.toggleValues}
            >
              {displayName}
            </span>
            <span className="filter-attribute-title-facet">
              <Checkbox
                checked={faceted}
                className="filter-attribute-facet-checkbox"
                onChange={this.onCheckboxChange}
              />
              Facet
            </span>
          </span>
          <span className="filter-attribute-toggle" onClick={this.toggleValues}>
            {!expanded && (
              <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM} />
            )}
            {expanded && (
              <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_TOP} />
            )}
          </span>
        </div>
        {expanded && valueItems}
      </div>
    )
  }
}
