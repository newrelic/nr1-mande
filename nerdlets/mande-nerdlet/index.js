import React from 'react'

import { PlatformStateContext, NerdGraphQuery, Stack, StackItem } from 'nr1'

import AccountPicker from '../../components/account-picker'
import MandeContainer from './MandeContainer'

export default class Mande extends React.Component {
  static contextType = PlatformStateContext

  state = {
    accounts: [],
    account: { name: 'Choose an account' },
    accountId: null,
  }

  async componentDidMount() {
    const query = `
      {
        actor {
          accounts {
            name
            id
          }
        }
      }
    `
    const { data } = await NerdGraphQuery.query({ query: query })

    const { accounts } = data.actor

    const account = accounts.length > 0 && accounts[0]
    this.setState({ accounts, account, accountId: account.id })
  }

  handleChangeAccount = account => {
    const accountId = account.id
    this.setState({ accountId })
  }

  render() {
    const { accounts, account, accountId } = this.state
    const {
      timeRange: { duration },
    } = this.context
    const durationInMinutes = duration / 1000 / 60

    return (
      <React.Fragment>
        <Stack
          fullWidth={true}
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          gapType={Stack.GAP_TYPE.SMALL}
          className="options-bar-parent"
        >
          <StackItem grow>
            <Stack
              directionType={Stack.DIRECTION_TYPE.HORIZONTAL_TYPE}
              verticalType={Stack.VERTICAL_TYPE.CENTER}
              className="options-bar"
              fullWidth
            >
              <StackItem>
                <AccountPicker
                  accounts={accounts}
                  account={account}
                  setAccount={this.handleChangeAccount}
                ></AccountPicker>
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
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
                duration={durationInMinutes}
              />
            </StackItem>
          </Stack>
        )}
      </React.Fragment>
    )
  }
}
