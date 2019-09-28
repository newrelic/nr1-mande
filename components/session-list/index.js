import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HeadingText, BarChart } from 'nr1';

/**
 * Core concept for this component is a DefaultComponent that aligns multiple streams of data around a single Vizco chart based on a set of NRQL queries executed through GraphQL and delivered as one Vizco formatted data set.
 */
export default class SessionList extends Component {
  static propTypes = {
    query: PropTypes.string.isRequired,
    callbacks: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { account_id, title, query, callbacks } = this.props;
    return (
      <section className="list-wrapper">
        <header className="list-header">
          <HeadingText type={HeadingText.TYPE.HEADING_4}>{title}</HeadingText>
          <p className="subtitle">Since ...</p>
        </header>
        <BarChart
          accountId={account_id}
          query={query}
          onClickBar={callbacks.sessionClick}
          fullWidth={true}
        />
      </section>
    );
  }
}
