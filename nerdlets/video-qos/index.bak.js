import React from 'react';
import PropTypes from 'prop-types';
import { DefaultWidget, GenericComponent } from '@datanerd/vizco';
import MultiFacetChart from '../../components/multifacet';
import FacetFilter from '../../components/facet-filter';
//import RadarChartWithTooltips from '../../components/radar'
import { FilterBar, FilterSet, Filter } from '@datanerd/nr-filter';
import { LoadingSpinner } from '@datanerd/nr-ui-legacy';

/*const thresholds = [
    {
        type: 'critical',
        limit: 5.0
    },
    {
        type: 'warning',
        limit: 1.0
    }
]*/
/**
 * @see https://pages.datanerd.us/wanda/wanda-ec-ui/v1/class/src/artifacts/nerdlet/Nerdlet.js~Nerdlet.html
 */
export default class VideoQoSNerdlet extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    relationshipsById: PropTypes.object,
    nr1: PropTypes.object,
    accountId: PropTypes.number,
    width: PropTypes.number,
  };

  static defaultProps = {
    accountId: 1567277,
  };

  constructor(props) {
    super(props);
    this.state = {
      filterSet: new FilterSet(),
      facets: null,
      eventType: 'PageAction',
    };
    this.whereClause = '';
    this.hiddenFilters = new FilterSet(
      new Filter({
        attribute: 'viewId',
        operator: Filter.OPERATORS.IS_NOT_NULL,
      })
    );
    this.callbacks = {
      facetClick: (series, chart, queryrProps) => {
        //console.log("facetClick", [series, chart])
        this.props.nr1.paneManager.openCard({
          id: 'wanda-video-demos.video-session-list',
          state: {
            facet: chart.metadata.facet,
            //filters: ,
            account_id: this._getAccountId(),
            eventType: this.state.eventType,
            baseNrql: queryrProps.sessionNrql
              ? queryrProps.sessionNrql
              : queryrProps.baseNrql,
          },
        });
      },
      setFacets: facets => {
        //console.log("Setting facets", facets)
        this.setState({ facets });
      },
      noDataAvailable: () => {
        this.setState({ nodata: true });
      },
    };
  }

  _getAccountId() {
    return this.props.entity
      ? this.props.entity.accountId
      : this.props.accountId;
  }

  recalculateWhere() {
    this.whereClause = this.state.filterSet.toNrql();
    if (this.whereClause.length > 0) {
      this.whereClause = `WHERE ` + this.whereClause;
    }
  }

  shouldComponentUpdate(nextProps) {
    //if we're looking at this from an entity-centric filter state, and we've picked a new entity, adjust the filterSet
    if (
      nextProps.entity &&
      (!this.props.entity || this.props.entity.id != nextProps.entity.id)
    ) {
      const filterSet = new Filter({
        attribute: 'appName',
        operator: Filter.OPERATORS.EQUAL,
        value: nextProps.entity.name,
      });
      this.setState({ filterSet });
    }
    return true;
  }

  render() {
    this.recalculateWhere();
    const {
      begin_time,
      duration,
      end_time,
    } = this.props.nr1.launcher.state.timeRange;
    const durationInMinutes = duration / 1000 / 60;
    const { facets, filterSet, eventType, nodata } = this.state;
    const { width, entity } = this.props;
    const { timeRange } = this.props.nr1.launcher.state;
    const { trackUserAction } = this.props.nr1.services.tessen;
    if (nodata) {
      return (
        <div className="qosContainer">
          <h1>
            {entity.name} has no video events in the specified time window.
          </h1>
        </div>
      );
    }
    return (
      <div className="qosContainer">
        <div>
          <FacetFilter
            eventType={eventType}
            nr1={this.props.nr1}
            accountId={this._getAccountId()}
            callbacks={this.callbacks}
            nrqlSelect={'SELECT count(viewId)'}
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
            <div className="containerFilter">
              <div className="filterSet">
                <FilterBar
                  accountId={this._getAccountId()}
                  eventType={eventType}
                  filters={filterSet}
                  onUpdate={filterSet => {
                    this.setState({ filterSet });
                  }}
                  trackUserAction={trackUserAction}
                  timeRange={timeRange}
                  width={width}
                  hiddenFilters={this.hiddenFilters}
                />
              </div>
            </div>
            <div className="chartContainer">
              <div className="chart">
                <DefaultWidget
                  title={`KPIs`}
                  type={GenericComponent.CHART_BILLBOARD}
                  query={{
                    account_id: this._getAccountId(),
                    begin_time,
                    duration,
                    end_time,
                    nrql: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as '% Videos with Buffer Events', (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'Error Rate', ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as '% Exits before Video Start', average(timeSinceRequested)/1000 as 'Seconds to First Frame' FROM ${eventType} ${this.whereClause} `,
                  }}
                />
              </div>
              <div className="chart threeQuartersWide">
                <DefaultWidget
                  title={`KPIs over time`}
                  type={GenericComponent.CHART_LINE}
                  query={{
                    account_id: this._getAccountId(),
                    begin_time,
                    duration,
                    end_time,
                    nrql: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as '% Videos with Buffer Events', (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'Error Rate', ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as '% Exits before Video Start', average(timeSinceRequested)/1000 as 'Seconds to First Frame' FROM ${eventType} ${this.whereClause} TIMESERIES COMPARE WITH ${durationInMinutes} MINUTES AGO`,
                  }}
                />
              </div>

              <div className="chart doubleHeight">
                <MultiFacetChart
                  callbacks={this.callbacks}
                  entity={this.props.entity}
                  facets={facets}
                  nr1={this.props.nr1}
                  queryProps={{
                    account_id: this.props.accountId,
                    compare: false,
                    percentage: false,
                    valueAttr: 'percentBuffering',
                    sessionNrql: `SELECT filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START') as 'bufferEvents'`,
                    baseNrql: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100 as 'percentBuffering'`,
                    eventType,
                    whereClause: this.whereClause,
                  }}
                  title={`% views with buffer events`}
                />
              </div>
              <div className="chart doubleHeight">
                <MultiFacetChart
                  callbacks={this.callbacks}
                  entity={this.props.entity}
                  facets={facets}
                  nr1={this.props.nr1}
                  queryProps={{
                    account_id: this.props.accountId,
                    compare: false,
                    percentage: true,
                    valueAttr: 'errorPercentage',
                    sessionNrql: `SELECT filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') as 'Errors'`,
                    baseNrql: `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'errorPercentage'`,
                    eventType,
                    whereClause: this.whereClause,
                  }}
                  title={`% views with errors`}
                />
              </div>
              <div className="chart doubleHeight">
                <MultiFacetChart
                  callbacks={this.callbacks}
                  entity={this.props.entity}
                  facets={facets}
                  nr1={this.props.nr1}
                  queryProps={{
                    account_id: this.props.accountId,
                    compare: false,
                    percentage: false,
                    valueAttr: 'EBVS',
                    sessionNrql: `SELECT filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START')`,
                    baseNrql: `SELECT ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as 'EBVS'`,
                    eventType,
                    whereClause: this.whereClause,
                  }}
                  title={`% of exits before the video starts`}
                />
              </div>
              <div className="chart doubleHeight">
                <MultiFacetChart
                  callbacks={this.callbacks}
                  entity={this.props.entity}
                  facets={facets}
                  nr1={this.props.nr1}
                  queryProps={{
                    account_id: this.props.accountId,
                    compare: false,
                    percentage: false,
                    valueAttr: 'TTFF',
                    baseNrql: `SELECT average(timeSinceRequested)/1000 as 'TTFF'`,
                    eventType,
                    whereClause: this.whereClause,
                  }}
                  title={`Average seconds to first frame`}
                />
              </div>
            </div>
          </div>
        ) : (
          <LoadingSpinner className="centered" />
        )}
      </div>
    );
  }
}
