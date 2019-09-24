import React from 'react';
import PropTypes from 'prop-types';

import FacetFilter from '../../components/facet-filter';
import MultiFacetChart from '../../components/multi-facet';

import { BillboardChart, BlockText, LineChart, navigation, Spinner } from 'nr1';

export default class VideoQoSNerdlet extends React.Component {
  static propTypes = {
    launcherUrlState: PropTypes.object,
    nerdletUrlState: PropTypes.object,
    accountId: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      isMounted: false,
      durationInMinutes: 0,
      //   entityGuid: null,
      eventType: 'PageAction',
      facets: null,
      whereClause: '',
      accountId: props.accountId || null,
      queries: {},
    };

    this.setFacets = facets => {
      this.setState({ facets });
    };

    this.facetClick = this.facetClick.bind(this);
  }

  componentDidUpdate(nextProps) {
    const { launcherUrlState, accountId } = nextProps;
    const { begin_time, duration, end_time } = launcherUrlState.timeRange;

    const currentDurationInMinutes = this.state.durationInMinutes;
    const nextDurationInMinutes = duration / 1000 / 60;
    const durationHasChanged =
      currentDurationInMinutes !== nextDurationInMinutes;
    const accountIdHasChanged = accountId && this.props.accountId !== accountId;

    if (durationHasChanged) {
      this.setState({ durationInMinutes: nextDurationInMinutes });
    }

    if (accountIdHasChanged) {
      this.setState({ accountId });
    }

    if (durationHasChanged || accountIdHasChanged) {
      // Update and store queries based on the changes above
      const queries = this.updateQueries({ ...this.state });
      this.setState({ queries });
    }
  }

  async componentDidMount() {
    this.setState({ isMounted: true });
    // this.initializeStateFromProps();
  }

  //   async initializeStateFromProps() {
  //     const state = {};

  //     // Filter by time
  //     const duration = _.get(
  //       this.props,
  //       'launcherUrlState.timeRange.duration',
  //       false
  //     );

  //     if (duration) {
  //       console.debug('componentDidMount:duration: ' + duration);
  //       const durationInMinutes = duration / 1000 / 60;
  //       state.durationInMinutes = durationInMinutes;
  //     }

  //     // Filter by a specific Account
  //     const accountId = this.props.accountId;
  //     if (accountId) {
  //       console.debug('componentDidMount:accountiId: ' + accountId);
  //       state.accountId = accountId;
  //     }

  //     // Filter by a specific Entity
  //     // const { entityGuid } = this.props.nerdletUrlState;
  //     // if (entityGuid) {
  //     //   const { data } = await EntityByGuidQuery.query({ entityGuid });
  //     //   if (data) {
  //     //     // const accountId = _.get(data, 'entities[0].accountId', false);
  //     //     state.entityGuid = data.guid;
  //     //     state.whereClause = `WHERE entityGuid='${entityGuid}'`;
  //     //   }
  //     // }

  //     // Update and store queries based on the changes above
  //     const queries = this.updateQueries({ ...this.state, ...state });
  //     state.queries = queries;

  //     console.debug(state);
  //     this.setState(state);
  //   }

  updateQueries(nextState) {
    const { durationInMinutes, eventType, whereClause } = nextState;

    return {
      kpiQuery: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as '% Videos with Buffer Events', (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'Error Rate', ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as '% Exits before Video Start', average(timeSinceRequested)/1000 as 'Seconds to First Frame' FROM ${eventType} ${whereClause} `,
      viewsQuery: `SELECT count(viewId)`,
      kpisOverTimeQuery: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as '% Videos with Buffer Events', (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'Error Rate', ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as '% Exits before Video Start', average(timeSinceRequested)/1000 as 'Seconds to First Frame' FROM ${eventType} ${whereClause} TIMESERIES COMPARE WITH ${durationInMinutes} MINUTES AGO`,
      viewsWithErrorsQuery: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'errorPercentage'`,
      viewsWithBufferEventsQuery: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100 as 'percentBuffering'`,
      sessionBufferEventsQuery: `SELECT filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START') as 'bufferEvents'`,
      sessionErrorsQuery: `SELECT filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') as 'Errors'`,
      viewsWithExitsBeforeStartQuery: `SELECT filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START')`,
      sessionsWithExitsBeforeStartQuery: `SELECT filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START')`,
      timeToFirstFrameQuery: `SELECT average(timeSinceRequested)/1000 as 'TTFF'`,
    };
  }

  facetClick({ data, metadata }) {
    // Note: data is x,y coordinates? Why? Of where they clicked? Or where the chart is located?

    console.dir(metadata);
    navigation.openStackedNerdlet({
      id: 'video-qos-session-nerdlet',
      urlState: {
        facet: metadata.facet,
        accountId: this.state.accountId,
        eventType: this.state.eventType,
        // baseNrql: queryProps.sessionNrql
        //   ? queryProps.sessionNrql
        //   : queryProps.baseNrql,
      },
    });
  }

  render() {
    const {
      accountId,
      durationInMinutes,
      //   entityGuid,
      eventType,
      facets,
      whereClause,
      queries,
    } = this.state;

    // console.debug(facets);

    // console.debug(accountId);
    // Account not provided
    if (!accountId) {
      return (
        <BlockText type={BlockText.TYPE.PARAGRAPH}>
          Please select an account.
        </BlockText>
      );
    }

    return (
      <div className="qosContainer">
        <div>
          <FacetFilter
            eventType={eventType}
            duration={durationInMinutes}
            accountId={accountId}
            setFacets={this.setFacets}
            nrqlSelect={queries.viewsQuery}
            config={{
              excludeDualFacets: true,
              excludes: [
                'session',
                'viewId',
                'elementId',
                'appName',
                'asnLatitude',
                'asnLongitude',
                'actionName',
              ],
              includes: ['deviceType'],
            }}
          />
        </div>

        {facets && facets.length > 0 ? (
          <div>
            <div className="chartContainer">
              <div className="chart">
                <BillboardChart
                  accountId={accountId}
                  query={queries.kpiQuery}
                ></BillboardChart>
              </div>

              <div className="chart threeQuartersWide">
                <LineChart
                  accountId={accountId}
                  query={queries.kpisOverTimeQuery}
                ></LineChart>
              </div>

              <div className="chart doubleHeight">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  entity={this.props.entity}
                  facets={facets}
                  launcherUrlState={this.launcherUrlState}
                  queryProps={{
                    accountId: this.state.accountId,
                    compare: false,
                    percentage: false,
                    valueAttr: 'percentBuffering',
                    sessionNrql: queries.sessionBufferEventsQuery,
                    baseNrql: queries.viewsWithBufferEventsQuery,
                    eventType,
                    whereClause,
                  }}
                  title={`% views with buffer events`}
                />
              </div>

              <div className="chart doubleHeight">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  facets={facets}
                  launcherUrlState={this.launcherUrlState}
                  queryProps={{
                    accountId: this.state.accountId,
                    compare: false,
                    percentage: true,
                    valueAttr: 'errorPercentage',
                    sessionNrql: queries.sessionErrorsQuery,
                    baseNrql: queries.viewsWithErrorsQuery,
                    eventType,
                    whereClause,
                  }}
                  title={`% views with errors`}
                />
              </div>

              <div className="chart doubleHeight">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  facets={facets}
                  launcherUrlState={this.launcherUrlState}
                  queryProps={{
                    accountId: this.state.accountId,
                    compare: false,
                    percentage: false,
                    valueAttr: 'EBVS',
                    sessionNrql: queries.sessionsWithExitsBeforeStartQuery,
                    baseNrql: queries.viewsWithExitsBeforeStartQuery,
                    eventType,
                    whereClause,
                  }}
                  title={`% of exits before the video starts`}
                />
              </div>

              <div className="chart doubleHeight">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  facets={facets}
                  launcherUrlState={this.launcherUrlState}
                  queryProps={{
                    accountId: this.state.accountId,
                    compare: false,
                    percentage: false,
                    valueAttr: 'TTFF',
                    baseNrql: queries.timeToFirstFrameQuery,
                    eventType,
                    whereClause,
                  }}
                  title={`Average seconds to first frame`}
                />
              </div>
            </div>
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    );
  }
}
