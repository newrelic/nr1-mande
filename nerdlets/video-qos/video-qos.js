import React from 'react';
import PropTypes from 'prop-types';

import FacetFilter from '../../components/facet-filter';
import MultiFacetChart from '../../components/multi-facet';

import {
  Icon,
  Grid,
  GridItem,
  BillboardChart,
  BlockText,
  LineChart,
  navigation,
  Spinner,
  HeadingText,
} from 'nr1';

const kpiIds = [
  'videosWithBufferEvents',
  'errorRate',
  'exitsBeforeVideoStart',
  'secondsToFirstFrame',
];

export default class VideoQoSNerdlet extends React.Component {
  static propTypes = {
    launcherUrlState: PropTypes.object,
    nerdletUrlState: PropTypes.object,
    accountId: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      eventType: 'PageAction',
      facets: null,
      whereClause: '',
      accountId: props.accountId || null,
      selectedKpi: 'secondsToFirstFrame',
    };

    this.setFacets = facets => {
      this.setState({ facets });
    };

    this.facetClick = this.facetClick.bind(this);
    this.kpiClick = this.kpiClick.bind(this);
  }

  kpiClick(selectedKpi) {
    this.setState({ selectedKpi });
  }

  _generateQueries(durationInMinutes, eventType, whereClause) {
    return {
      kpiQueries: {
        videosWithBufferEvents: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as '% Videos with Buffer Events' FROM ${eventType} ${whereClause} COMPARE WITH 3 days AGO`,
        errorRate: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'Error Rate' FROM ${eventType} ${whereClause} COMPARE WITH 3 days AGO`,
        exitsBeforeVideoStart: `SELECT ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as '% Exits before Video Start' FROM ${eventType} ${whereClause} COMPARE WITH 3 days AGO`,
        secondsToFirstFrame: `SELECT average(timeSinceRequested)/1000 as 'Seconds to First Frame' FROM ${eventType} ${whereClause} WHERE actionName = 'CONTENT_START' COMPARE WITH 3 days AGO`,
      },
      viewsQuery: `SELECT count(viewId)`,
      kpisOverTimeQuery: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as '% Videos with Buffer Events', (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'Error Rate', ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as '% Exits before Video Start', filter(average(timeSinceRequested)/1000, WHERE actionName = 'CONTENT_START' as 'Seconds to First Frame') FROM ${eventType} ${whereClause} TIMESERIES COMPARE WITH ${durationInMinutes} MINUTES AGO`,
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
      id: 'video-session-list',
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

  _getMultiFacetChart(queries) {
    const {
      launcherUrlState: {
        timeRange: { duration },
      },
    } = this.props;
    const { launcherUrlState } = this.props;
    //debugger;
    const durationInMinutes = duration / 1000 / 60;
    const {
      accountId,
      eventType,
      facets,
      whereClause,
      selectedKpi,
    } = this.state;
    switch (selectedKpi) {
      case 'videosWithBufferEvents':
        return (
          <React.Fragment>
            <div className="primarySectionChartHeader primarySectionChartaltHeader">
              <HeadingText
                className="sectionTitle"
                type={HeadingText.TYPE.HEADING_3}
              >
                highest % videos with buffer events
              </HeadingText>
              {/* <small className="sectionSubtitle">Since 3 days ago</small> */}
            </div>
            <div className="minimizePanelButton">
              <Icon
                type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
                color="#464e4e"
              ></Icon>
            </div>
            <div className="detailPanelBody">
              <div className="chart barList">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  entity={this.props.entity}
                  facets={facets}
                  launcherUrlState={launcherUrlState}
                  queryProps={{
                    accountId: accountId,
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
            </div>
          </React.Fragment>
        );

      case 'errorRate':
        return (
          <React.Fragment>
            <div className="primarySectionChartHeader primarySectionChartaltHeader">
              <HeadingText
                className="sectionTitle"
                type={HeadingText.TYPE.HEADING_3}
              >
                highest % videos with buffer events
              </HeadingText>
              {/* <small className="sectionSubtitle">Since 3 days ago</small> */}
            </div>
            <div className="minimizePanelButton">
              <Icon
                type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
                color="#464e4e"
              ></Icon>
            </div>
            <div className="detailPanelBody">
              <div className="chart barList">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  facets={facets}
                  launcherUrlState={launcherUrlState}
                  queryProps={{
                    accountId: accountId,
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
            </div>
          </React.Fragment>
        );

      case 'exitsBeforeVideoStart':
        return (
          <React.Fragment>
            <div className="primarySectionChartHeader primarySectionChartaltHeader">
              <HeadingText
                className="sectionTitle"
                type={HeadingText.TYPE.HEADING_3}
              >
                highest % videos with buffer events
              </HeadingText>
              {/* <small className="sectionSubtitle">Since 3 days ago</small> */}
            </div>
            <div className="minimizePanelButton">
              <Icon
                type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
                color="#464e4e"
              ></Icon>
            </div>
            <div className="detailPanelBody">
              <div className="chart barList">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  facets={facets}
                  launcherUrlState={launcherUrlState}
                  queryProps={{
                    accountId: accountId,
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
            </div>
          </React.Fragment>
        );

      case 'secondsToFirstFrame':
        return (
          <React.Fragment>
            <div className="primarySectionChartHeader primarySectionChartaltHeader">
              <HeadingText
                className="sectionTitle"
                type={HeadingText.TYPE.HEADING_3}
              >
                highest % videos with buffer events
              </HeadingText>
              {/* <small className="sectionSubtitle">Since 3 days ago</small> */}
            </div>
            <div className="minimizePanelButton">
              <Icon
                type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD}
                color="#464e4e"
              ></Icon>
            </div>
            <div className="detailPanelBody">
              <div className="chart barList">
                <MultiFacetChart
                  facetClick={this.facetClick}
                  facets={facets}
                  launcherUrlState={launcherUrlState}
                  queryProps={{
                    accountId: accountId,
                    compare: false,
                    percentage: false,
                    valueAttr: 'TTFF',
                    baseNrql: queries.timeToFirstFrameQuery,
                    eventType,
                    whereClause:
                      whereClause + ` WHERE actionName = 'CONTENT_START' `,
                  }}
                  title={`Average seconds to first frame`}
                />
              </div>
              <div className="minimizePanelButton">
                <Icon
                  type={
                    Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__WEIGHT_BOLD
                  }
                  color="#464e4e"
                ></Icon>
              </div>
              <div className="detailPanelBody">
                <div className="chart barList">
                  <MultiFacetChart
                    facetClick={this.facetClick}
                    facets={facets}
                    launcherUrlState={launcherUrlState}
                    queryProps={{
                      accountId: accountId,
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
          </React.Fragment>
        );
      default:
        return null;
    }
  }

  render() {
    const {
      launcherUrlState: {
        timeRange: { duration },
      },
    } = this.props;
    //debugger;
    const durationInMinutes = duration / 1000 / 60;
    const {
      accountId,
      eventType,
      facets,
      whereClause,
      selectedKpi,
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

    const queries = this._generateQueries(
      durationInMinutes,
      eventType,
      whereClause
    );

    return (
      <React.Fragment>
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
                'viewSessionId',
                'viewSession',
              ],
              includes: ['deviceType'],
            }}
          />
        </div>

        {facets && facets.length > 0 ? (
          <div>
            <Grid>
              <GridItem columnSpan={9}>
                <div className="primarySectionChartContainer">
                  <div className="primarySectionChartHeader primarySectionChartaltHeader">
                    <HeadingText
                      className="sectionTitle"
                      type={HeadingText.TYPE.HEADING_3}
                    >
                      KPIs
                    </HeadingText>
                    <small className="sectionSubtitle">Since 3 days ago</small>
                  </div>
                  <div className="kpiCharts">
                    {kpiIds.map((kpiId, key) => {
                      return (
                        <div
                          className={`billboardChart ${
                            selectedKpi == kpiId
                              ? 'billboardChart-selected'
                              : ''
                          }`}
                          key={key}
                        >
                          <BillboardChart
                            accountId={accountId}
                            query={queries.kpiQueries[kpiId]}
                            onClickBillboard={() => {
                              this.kpiClick(kpiId);
                            }}
                          ></BillboardChart>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="primarySectionChartContainer">
                  <div className="primarySectionChartHeader">
                    <HeadingText
                      className="sectionTitle"
                      type={HeadingText.TYPE.HEADING_3}
                    >
                      KPIs over time
                    </HeadingText>
                    <small className="sectionSubtitle">
                      Since 3 days ago compared with 3 days earlier
                    </small>
                  </div>
                  <LineChart
                    accountId={accountId}
                    query={queries.kpisOverTimeQuery}
                    fullWidth
                    className="primarySectionChart"
                  ></LineChart>
                </div>
              </GridItem>

              <GridItem columnSpan={3}>
                <div
                  className={`primarySectionChartContainer detailsPanel ${
                    !selectedKpi ? 'emptyState' : ''
                  }`}
                >
                  {selectedKpi && this._getMultiFacetChart(queries)}

                  <div className="emptyState">
                    <div className="bar-chart-placeholder">
                      <svg
                        width="270"
                        height="60"
                        viewBox="0 0 270 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="270" height="60" rx="4" fill="#F4F5F5" />
                        <rect
                          x="12"
                          y="41"
                          width="248"
                          height="8"
                          rx="4"
                          fill="#E3E4E4"
                        />
                        <rect
                          x="12"
                          y="41"
                          width="100"
                          height="8"
                          rx="4"
                          fill="#D5D7D7"
                        />
                        <rect
                          x="226"
                          y="11"
                          width="34"
                          height="21"
                          rx="2"
                          fill="#E3E4E4"
                        />
                        <rect
                          x="12"
                          y="11"
                          width="150"
                          height="21"
                          rx="2"
                          fill="#E3E4E4"
                        />
                      </svg>
                    </div>
                    <h4 className="emptyStateHeader">
                      Click on a KPI to view details
                    </h4>
                    <p className="emptyStateDescription">
                      When you click on one of the KPIs (to the right) you will
                      be able to view details for nulla quis tortor orci.
                    </p>
                  </div>
                </div>
              </GridItem>
            </Grid>
          </div>
        ) : (
          <Spinner fillContainer />
        )}
      </React.Fragment>
    );
  }
}
