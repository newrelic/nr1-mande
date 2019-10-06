import React from 'react';
import PropTypes from 'prop-types';

import FacetFilter from '../../components/facet-filter';
import MultiFacetChart from '../../components/multi-facet';
import MultiQueryTimeseries from '../../components/multi-query-timeseries';
import { generateQueries, kpiIds, multiFacetChartTitles } from '../../utils/kpi-queries';

import { navigation } from 'nr1';

export default class VideoQoSNerdlet extends React.Component {
  static propTypes = {
    launcherUrlState: PropTypes.object,
    accountId: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      eventType: 'PageAction',
      facets: null,
      whereClause: '',
      accountId: props.accountId || null,
      selectedKpi: kpiIds[0],
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
    const {
      accountId,
      eventType,
      whereClause,
      selectedKpi,
    } = this.state;

    console.dir(metadata);
    navigation.openStackedNerdlet({
      id: 'video-session-list',
      urlState: {
        facet: metadata.facet,
        accountId,
        eventType,
        whereClause,
        selectedKpi
      },
    });
  }

  _getMultiFacetChart(queries) {
    const {
      accountId,
      facets,
      selectedKpi,
    } = this.state;
    const nrql = queries.kpiQueries[selectedKpi];
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
                valueAttr: 'percentBuffering',
                nrql,
              }}
              title={title}
            />
          </div>
        </div>
    );
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

    const queries = generateQueries(durationInMinutes, eventType, whereClause);

    return (
      <React.Fragment>
        <div>
          <FacetFilter
            eventType={eventType}
            duration={durationInMinutes}
            accountId={accountId}
            setFacets={this.setFacets}
            nrqlSelect={queries.facetFilterQuery}
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
                            query={queries.kpiQueries[kpiId](true, false)}
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
                  <MultiQueryTimeseries
                    accountId={accountId}
                    queries={queries.kpiQueries}
                    fullWidth
                    className="primarySectionChart"
                  />
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
