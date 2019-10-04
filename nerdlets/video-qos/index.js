import React from 'react';
import gql from 'graphql-tag';

import { PlatformStateContext, NerdletStateContext } from 'nr1';
import VideoQoSNerdlet from './video-qos';
import AccountPicker from '../../components/account-picker';
import { AccountsQuery, Button, navigation, Stack, StackItem } from 'nr1';

export default class Wrapper extends React.PureComponent {
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
    const { data } = await AccountsQuery.query();
    const accounts = data;

    const account = accounts.length > 0 && accounts[0];
    this.setState({
      accounts,
      account,
      accountId: account.id,
    });
  }

  setAccount(account) {
    const accountId = account.id;
    this.setState({ accountId });
  }

  render() {
    // console.debug(this.state);
    const { accounts, account, accountId } = this.state;

    return (
      <React.Fragment>
        <Stack
          fullWidth={true}
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          horizontalType={Stack.HORIZONTAL_TYPE.LEFT}
          gapType={Stack.GAP_TYPE.SMALL}
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
                      id: 'eea3de01-ef97-4602-b795-37db5dbb3982.mande-launcher',
                      urlStateOptions: '',
                    };
                    navigation.openLauncher(launcher);
                  }}
                  type={Button.TYPE.PRIMARY}
                  iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SHARE}
                >
                  Main Page
                </Button>
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>

        {accountId && (
          <PlatformStateContext.Consumer>
            {launcherUrlState => (
              <NerdletStateContext.Consumer>
                {nerdletUrlState => (
                  <VideoQoSNerdlet
                    launcherUrlState={launcherUrlState}
                    nerdletUrlState={nerdletUrlState}
                    accountId={accountId}
                  />
                )}
              </NerdletStateContext.Consumer>
            )}
          </PlatformStateContext.Consumer>
        )}
      </React.Fragment>
    );
  }
}
