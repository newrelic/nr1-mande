import React from 'react';
import gql from 'graphql-tag';

import { PlatformStateContext, NerdletStateContext } from 'nr1';
import VideoQoSNerdlet from './video-qos';
import AccountPicker from '../../components/account-picker';
import { NerdGraphQuery } from 'nr1';

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
    const query = gql`
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

    // console.debug(accounts);

    const account = accounts.length > 0 && accounts[0];
    this.setState({ accounts, account, accountId: account.id });
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
        <AccountPicker
          accounts={accounts}
          account={account}
          setAccount={this.setAccount}
        ></AccountPicker>
        {accountId && (
          <PlatformStateContext.Consumer>
            {(launcherUrlState) => (
              <NerdletStateContext.Consumer>
                {(nerdletUrlState) => (
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
