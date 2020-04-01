import React from 'react'
import { Checkbox } from 'nr1'
import { render } from 'react-dom'

export default class AttributeValue extends React.PureComponent {
  onCheckboxChange = () => {
    const { selected, attribute, value, attributeToggle } = this.props
    attributeToggle(attribute, value, !selected)
  }

  render() {
    const { selected, value } = this.props

    return (
      <div className="filter-attribute-item">
        <span className="filter-attribute-checkbox">
          <Checkbox
            checked={selected}
            className="filter-attribute-checkbox-input"
            onChange={this.onCheckboxChange}
          />
        </span>
        <span
          onClick={this.onCheckboxChange}
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
  }
}