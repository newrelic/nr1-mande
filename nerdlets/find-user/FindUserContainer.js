import React from 'react'
import { Stack, StackItem, HeadingText } from 'nr1'

export default class FindUserContainer extends React.Component {
  state = {
    user: '',
  }

  onSelectUser = async => {
    
  }

  render() {
    return (
      <Stack
        fullWidth
        horizontalType={Stack.HORIZONTAL_TYPE.FILL}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
      >
        <StackItem>
          <header className="header">
            <HeadingText type={HeadingText.TYPE.HEADING_3}>
              Find User
            </HeadingText>
          </header>
        </StackItem>
        <StackItem className="user-search">Search goes here</StackItem>
        <StackItem className="user-details">Results go here</StackItem>
      </Stack>
    )
  }
}
