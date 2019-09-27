import React from 'react';
import PropTypes from 'prop-types';

import {
  Grid,
  GridItem,
  NerdGraphQuery,
  Stack,
  StackItem,
  LineChart,
} from 'nr1';

import AccountPicker from '../../components/account-picker';
import Board from '../../components/board';

export default class Meande extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      account: { name: 'Choose an account' },
      accountId: null,
    };

    this.setAccount = this.setAccount.bind(this);
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
    `;
    const { data } = await NerdGraphQuery.query({ query: query });

    const { accounts } = data.actor;

    const account = accounts.length > 0 && accounts[0];
    this.setState({ accounts, account, accountId: account.id });
  }

  setAccount(account) {
    const accountId = account.id;
    this.setState({ accountId });
  }

  render() {
    const { accounts, account, accountId } = this.state;

    return (
      <React.Fragment>
        <AccountPicker
          accounts={accounts}
          account={account}
          setAccount={this.setAccount}
        ></AccountPicker>
        {accountId && (
          <Stack
            fullWidth={true}
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
            gapType={Stack.GAP_TYPE.SMALL}
            style={{ width: '1200px' }}
          >
            <StackItem>
              <Board accountId={accountId} />
            </StackItem>
            <StackItem style={{ width: '100%' }}>
              <Grid>
                <GridItem columnSpan={6}>
                  <LineChart
                    accountId={accountId}
                    query="SELECT filter(count(*), WHERE actionName = 'CONTENT_ERROR') AS 'Errors', uniquecount(viewId) AS 'Concurrent Streams' FROM PageAction since 1 week ago TIMESERIES"
                    fullWidth
                  />
                </GridItem>
                <GridItem columnSpan={6}>
                  <LineChart
                    accountId={accountId}
                    query="SELECT sum(timeSinceRequested)/1000 AS 'Join Time', uniqueCount(viewId) AS 'Concurrent Sessions' FROM PageAction WHERE actionName = 'CONTENT_START' since 1 day ago timeseries"
                    fullWidth
                  />
                </GridItem>
              </Grid>
            </StackItem>
          </Stack>
        )}
      </React.Fragment>
    );
  }
}
