import React from 'react'
import { Dropdown, DropdownItem, Icon } from 'nr1'

export default class DimensionDropDown extends React.Component {
  state = {
    values: [],
    loading: false,
    selected: null,
  }

  getValues = async () => {
    this.setState({ loading: true })

    const { config } = this.props
    let { selected } = this.state
    const values = await config.data()
    if (config.mandatory && !selected) {
      // Todo: this obviously needs to be updated to handle changes to the selected or if a refreshed list no longer has the selected
      selected = values[0]
      config.handler(selected)
    }

    this.setState({ values, loading: false, selected })
  }

  onSelectItem = event => {
    const { target } = event
    const { config } = this.props
    const { values } = this.state
    const value = values.filter(val => val.name === target.value)
    config.handler(value)
  }

  onOpen = () => {
    console.debug('DimensionDropDown.onOpen')
    this.getValues() // refresh the data displayed
  }

  onSearch = () => {
    console.debug('DimensionDropDown.onSearch')
    // do some filtering stuff
  }

  async componentDidMount() {
    await this.getValues()
  }

  render() {
    const { config } = this.props
    const { selected } = this.state

    const items = this.state.values.map(val => (
      <DropdownItem key={val.id} onClick={this.onSelectItem}>
        {val.name}
      </DropdownItem>
    ))

    return (
      <Dropdown
        label={config.name}
        title={selected ? selected.name : ''}
        onSearch={this.onSearch}
      >
        {items}
      </Dropdown>
    )
  }
}
