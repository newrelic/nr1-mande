import React from 'react'
import { Dropdown, DropdownItem, Icon } from 'nr1'

export default class DimensionDropDown extends React.Component {
  state = {
    values: [],
    loading: false,
    selected: null,
  }

  initializeValues = async history => {
    this.setState({ loading: true })

    const { config } = this.props
    let selected = null

    const values = await config.data()

    if (values) {
      if (history) selected = values.filter(value => value.id === history)[0]
      if (config.mandatory && !selected) selected = values[0]
      config.handler(selected)
    }

    this.setState({ values, loading: false, selected })
  }

  onSelectItem = value => {
    console.log('onSelectItem', value)
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
    console.debug('dimensionDropDown.componentDidMount')
    const { config, history } = this.props
    let selectedValue = null

    if (history) {
      for (let dimension of history) {
        if (dimension.name === config.name) {
          selectedValue = dimension.value
          break
        }
      }
    }

    await this.initializeValues(selectedValue)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.selected === nextState.selected) return false
    else return true
  }

  render() {
    const { config } = this.props
    const { selected } = this.state

    console.debug(`dimensionDropDown.render (${config.name})`)
    
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
