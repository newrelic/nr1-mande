import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';

import FacetFilter from '../../components/facet-filter';
import MultiFacetChart from '../../components/multi-facet';
import MultiQueryTimeseries from '../../components/multi-query-timeseries';
import {
  kpiIds,
  generateQueries,
  multiFacetChartTitles,
} from '../../utils/kpi-queries';

import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
momentDurationFormatSetup(moment);

import {
  navigation,
  NerdGraphQuery,
  Spinner,
  HeadingText,
  BillboardChart,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from 'nr1';

export default class VideoQoSNerdlet extends React.Component {
  static propTypes = {
    launcherUrlState: PropTypes.object,
    accountId: PropTypes.number,
  };

  constructor(props) {
    super(props);
    //console.debug([props, kpiIds]);
    //debugger;
    this.state = {
      eventType: 'PageAction',
      facets: null,
      whereClause: '',
      accountId: props.accountId || null,
      selectedKpi: null,
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

  facetClick({ data, metadata }) {
    // Note: data is x,y coordinates? Why? Of where they clicked? Or where the chart is located?
    const { accountId, eventType, whereClause, selectedKpi } = this.state;

    console.dir(metadata);
    navigation.openStackedNerdlet({
      id: 'video-session-list',
      urlState: {
        facet: metadata.facet,
        accountId,
        eventType,
        whereClause,
        selectedKpi,
      },
    });
  }

  _getMultiFacetChart(queries) {
    const { accountId, facets, selectedKpi } = this.state;
    //console.debug([this.state, queries]);
    const nrql = queries.kpiQueries[selectedKpi](false, false);
    const title = multiFacetChartTitles[selectedKpi];
    return (
      <div className="detailPanelBody">
        <div className="chart barList">
          <MultiFacetChart
            facetClick={this.facetClick}
            facets={facets}
            queryProps={{
              accountId: accountId,
              percentage: selectedKpi == 'secondsToFirstFrame',
              valueAttr: selectedKpi,
              nrql,
            }}
            title={title}
          />
        </div>
      </div>
    );
  }

  buildFacets() {
    function capitalize(s) {
      return s[0].toUpperCase() + s.slice(1);
    }

    function replacer1(match, p1, p2, p3) {
      return p1 + capitalize(p2) + ' ' + p3;
    }

    const { accountId, duration, eventType, nrqlSelect } = this.props;
    const durationInMinutes =
      duration / 1000 / 60 < 24 * 60 ? 24 * 60 : duration / 1000 / 60;
    const query = gql`{
            actor {
                account(id: ${accountId}) {
                    nrql(query: "${nrqlSelect} FROM ${eventType} SINCE ${durationInMinutes} MINUTES AGO") {
                        results
                        suggestedFacets {
                            attributes
                        }
                    }
                }
            }
        }`;

    let facets = [];
    const selections = [];
    const { excludeDualFacets, excludes, includes } = {
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
        'message',
        'viewSession',
      ],
      includes: ['deviceType'],
    };

    if (includes) {
      includes.forEach(include => {
        facets.push({
          valueAttr: include,
          title: include.replace(/(^|[^a-z])([a-z]+)([A-Z])/, replacer1),
          limit: 5,
        });
        selections[include] = true;
      });
    }

    NerdGraphQuery.query({ query }).then(res => {
      const { loading, data, errors } = res;
      const suggestedFacets = _.get(
        data,
        'actor.account.nrql.suggestedFacets',
        []
      );

      suggestedFacets.forEach(suggestedFacet => {
        let addFacet = true;
        const valueAttr = suggestedFacet.attributes[0];

        if (excludeDualFacets && valueAttr.indexOf(',') < 0) {
          addFacet = false;
        }

        if (excludes) {
          addFacet = excludes.find(exclude => exclude == valueAttr) == null;
        }

        if (
          addFacet &&
          facets.find(facet => facet.valueAttr == valueAttr) == null
        ) {
          facets.push({
            valueAttr,
            title: valueAttr.replace(/(^|[^a-z])([a-z]+)([A-Z])/, replacer1),
            limit: 5,
          });
          selections[valueAttr] = true;
        }
      });
      facets = facets.sort();

      this.setFacets(facets);
    });
  }

  componentDidMount() {
    this.buildFacets();
  }

  render() {
    const {
      launcherUrlState: { timeRange },
    } = this.props;
    const { duration } = timeRange;

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

    const queries = generateQueries(durationInMinutes, eventType, whereClause);

    return (
      <React.Fragment>
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
                    <small className="sectionSubtitle">
                      Since {moment.duration(duration).format()} ago
                    </small>
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
                            query={queries.kpiQueries[kpiId](true, false)}
                            onClickBillboard={() => {
                              this.kpiClick(kpiId);
                            }}
                          />
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
                      Since {moment.duration(duration).format({ trim: true })}{' '}
                      ago ompared with{' '}
                      {moment.duration(duration * 2).format({ trim: true })}{' '}
                      earlier
                    </small>
                  </div>
                  <div
                    className="primarySectionChart"
                    style={{ padding: '10px' }}
                  >
                    <MultiQueryTimeseries
                      accountId={accountId}
                      timeRange={timeRange}
                      queries={queries.kpiQueries}
                      fullWidth
                      fullHeight
                    />
                  </div>
                </div>
              </GridItem>

              <GridItem columnSpan={3} className="detailsPanelGridItem">
                <div
                  className={`primarySectionChartContainer detailsPanel ${
                    !selectedKpi ? 'emptyStateActive' : ''
                  }`}
                >
                  <div className="primarySectionChartaltHeader primarySectionChartHeader">
                    <HeadingText
                      className="sectionTitle"
                      type={HeadingText.TYPE.HEADING_3}
                    >
                      {multiFacetChartTitles[selectedKpi]}
                    </HeadingText>

                    <p className="primarySectionChartHeaderDescription">
                      The following attributes were most common to this
                      measurement. Click on an attribute to review sessions that
                      match that characteristic in this time window.
                    </p>
                  </div>

                  <FacetFilter
                    isClearable={false}
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
                  {selectedKpi && this._getMultiFacetChart(queries)}

                  <Stack
                    className="emptyState"
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                    horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
                    directionType={Stack.DIRECTION_TYPE.VERTICAL}
                    fullHeight
                    fullWidth
                  >
                    <StackItem className="bar-chart-placeholder">
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
                    </StackItem>
                    <StackItem>
                      <h4 className="emptyStateHeader">
                        Click on a KPI to view details
                      </h4>
                    </StackItem>
                    <StackItem>
                      <p className="emptyStateDescription">
                        When you click on one of the KPIs (to the left), you'll
                        see a list of the most relevant attribute to that
                        performance. From there, you can click through to
                        explore individual sessions.
                      </p>
                    </StackItem>
                  </Stack>
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
