import React from 'react'

import { PlatformStateContext, NerdGraphQuery, Stack, StackItem } from 'nr1'

import MandeContainer from './MandeContainer'
import DimensionContainer from './DimensionContainer'

export default class Mande extends React.Component {
  static contextType = PlatformStateContext

  state = {
    accountId: null,
    threshold: 'All',
  }

  dimensionConfigs = [
    {
      name: 'Accounts',
      mandatory: true,
      data: async () => {
        const { data } = await this.query(`{
            actor {
              accounts {
                name
                id
              }
            }
          }`)
        const { accounts } = data.actor
        return accounts
      },
      handler: account => {
        this.setState({ accountId: account.id })
      },
    },
    {
      name: 'Level',
      mandatory: true,
      data() {
        return [
          { id: 1, name: 'All' },
          { id: 2, name: 'Warning' },
          { id: 3, name: 'Critical' },
        ]
      },
      handler: level => {
        this.setState({ threshold: level.name })
      },
    },
  ]

  query = async graphql => {
    return await NerdGraphQuery.query({ query: graphql })
  }

  render() {
    console.info('mande-nerdlet.index.render')

    const { accountId, threshold } = this.state

    console.info('mande-nerdlet.index', accountId, threshold)
    const {
      timeRange: { duration },
    } = this.context
    const durationInMinutes = duration / 1000 / 60

    return (
      <React.Fragment>
        <DimensionContainer configs={this.dimensionConfigs}/>
        {accountId && (
          <Stack
            fullWidth={true}
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
            gapType={Stack.GAP_TYPE.SMALL}
            className="main-panel"
          >
            <StackItem grow>
              <MandeContainer
                accountId={accountId}
                threshold={threshold}
                duration={durationInMinutes}
              />
            </StackItem>
          </Stack>
        )}
      </React.Fragment>
    )
  }
}
