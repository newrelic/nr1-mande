import React from 'react'
import { Stack, StackItem, NerdGraphQuery } from 'nr1'
import DimensionDropDown from '../../components/dimension/DimensionDropDown'

const dimensionContainer = props => {
  const { configs } = props
  const dimensions = configs
    .map(config => {
      return [...Array(config)].map((_, idx) => {
        return (
          <StackItem key={config.name + idx}>
            <DimensionDropDown config={config} duration={props.duration} />
          </StackItem>
        )
      })
    })
    .reduce((arr, val) => {
      return arr.concat(val)
    }, [])

  return (
    <React.Fragment>
      <Stack
        fullWidth={true}
        directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
        gapType={Stack.GAP_TYPE.SMALL}
        className="options-bar-parent"
      >
        <StackItem>
          <Stack
            directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
            className="options-bar"
            fullWidth
          >
            {dimensions}
          </Stack>
        </StackItem>
      </Stack>
    </React.Fragment>
  )
}

export default dimensionContainer
