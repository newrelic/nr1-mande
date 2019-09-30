import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Grid,
  GridItem,
  navigation,
  NerdGraphQuery,
  Stack,
  StackItem,
  LineChart,
} from 'nr1';

import AccountPicker from '../../components/account-picker';
import Board from '../../components/board';

export default class Mande extends React.Component {
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
        <Stack
          fullWidth={true}
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          horizontalType={Stack.HORIZONTAL_TYPE.LEFT}
          gapType={Stack.GAP_TYPE.SMALL}
          style={{ marginLeft: '50px' }}
        >
          <StackItem>
            <Stack directionType={Stack.DIRECTION_TYPE.HORIZONTAL_TYPE}>
              <StackItem>
                <AccountPicker
                  accounts={accounts}
                  account={account}
                  setAccount={this.setAccount}
                ></AccountPicker>
              </StackItem>
              <StackItem>
                <Button
                  onClick={() => {
                    const launcher = {
                      id:
                        '5317892d-9cac-4199-8ee1-f6c08d5d9597.video-qos-launcher',
                      urlStateOptions: '',
                    };
                    navigation.openLauncher(launcher);
                  }}
                  type={Button.TYPE.PRIMARY}
                  iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SHARE}
                >
                  Video QoS
                </Button>
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
          >
            <StackItem>
              <Board accountId={accountId} />
            </StackItem>

            <StackItem style={{ width: '100%', maxWidth: '1200px' }}>
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
