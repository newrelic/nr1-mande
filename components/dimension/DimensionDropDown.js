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
    if (config.mandatory && !selected && values) {
      // Todo: this obviously needs to be updated to handle changes to the selected or if a refreshed list no longer has the selected
      selected = values[0]
      config.handler(selected)
    }

    this.setState({ values, loading: false, selected })
  }

  onSelectItem = value => {
    const { config } = this.props
    config.handler(value)
    this.setState({ selected: value })
  }

  onOpen = () => {
    console.debug('DimensionDropDown.onOpen')
    // refresh the data displayed?
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
      <DropdownItem key={val.id} onClick={() => this.onSelectItem(val)}>
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
