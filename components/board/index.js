import React from 'react';
import PropTypes from 'prop-types';

import { Link, navigation, NerdGraphQuery, Icon } from 'nr1';

import CellDetails from './cell-details';

export default class Board extends React.Component {
  static propTypes = {
    accountId: PropTypes.number,
    currentUser: PropTypes.object,
    timeRange: PropTypes.object,
    onClose: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      board: {
        name: 'Video QoE',
        event: 'Page Action',
      },
      rows: [],
      cols: [],
      cells: [],
      data: {},
      alerts: {},
      timeoutId: null,
      modalHidden: true,
      detailsForCell: null,
    };

    this.fetchAlertStatuses = this.fetchAlertStatuses.bind(this);
    this.parseAlertStatuses = this.parseAlertStatuses.bind(this);
    this.humanizeNumber = this.humanizeNumber.bind(this);
    this.getCellContent = this.getCellContent.bind(this);

    this.videoQosNerdlet = () => {
      return {
        id: 'video-qos-nerdlet',
        urlStateOptions: '',
      };
    };

    this.containerExplorerNerdlet = () => {
      return {
        id: 'container-explorer',
        urlStateOptions: '',
      };
    };
  }

  componentDidMount() {
    this.getBoard();
  }

  componentDidUpdate(prevProps) {
    const { timeRange } = this.props;
    const prevTimeRange = prevProps.timeRange;

    if (!timeRange || !prevTimeRange) return;
    if (
      Object.keys(timeRange).every(
        t =>
          prevTimeRange.hasOwnProperty(t) && timeRange[t] === prevTimeRange[t]
      )
    )
      return;

    const { timeoutId } = this.state;
    if (timeoutId) clearTimeout(timeoutId);
    this.getBoard();
  }

  componentWillUnmount() {
    const { timeoutId } = this.state;
    if (timeoutId) clearTimeout(timeoutId);
  }

  // @gil - I think we need to transform whatever queries you make into this relative format
  getBoard() {
    this.setState({
      cells: [
        {
          col: 'Users',
          details: {
            is: '', // Possible values are 'more' and 'less'
            key: 'someattribute',
            name: 'latest_someattribute',
            str: 'latest(`someattribute`) AS latest_someattribute',
            value: '1',
          },
          row: 'Availability',
          navigateTo: this.videoQosNerdlet,
        },
        {
          col: 'Video',
          details: {
            is: '', // Possible values are 'more' and 'less'
            key: 'someattribute',
            name: 'latest_someattribute',
            str: 'latest(`someattribute`) AS latest_someattribute',
            value: '1',
          },
          row: 'Availability',
          navigateTo: this.videoQosNerdlet,
        },
        {
          col: 'Video',
          details: {
            is: '', // Possible values are 'more' and 'less'
            key: 'someattribute',
            name: 'latest_someattribute',
            str: 'latest(`someattribute`) AS latest_someattribute',
            value: '1',
          },
          row: 'Latency',
          navigateTo: this.videoQosNerdlet,
        },
        {
          col: 'Video',
          details: {
            is: '', // Possible values are 'more' and 'less'
            key: 'someattribute',
            name: 'latest_someattribute',
            str: 'latest(`someattribute`) AS latest_someattribute',
            value: '1',
          },
          row: 'Error Budget',
          navigateTo: this.videoQosNerdlet,
        },
        {
          col: 'Video',
          details: {
            is: '', // Possible values are 'more' and 'less'
            key: 'someattribute',
            name: 'latest_someattribute',
            str: 'latest(`someattribute`) AS latest_someattribute',
            value: '1',
          },
          row: 'Capacity',
          navigateTo: this.videoQosNerdlet,
        },
        {
          col: 'CDN',
          details: {
            is: '', // Possible values are 'more' and 'less'
            key: 'someattribute',
            name: 'latest_someattribute',
            str: 'latest(`someattribute`) AS latest_someattribute',
            value: '1',
          },
          row: 'Error Budget',
          navigateTo: this.containerExplorerNerdlet,
        },
      ],
      cols: [
        {
          label: 'Users',
          navigateTo: undefined,
        },
        {
          label: 'Video',
          navigateTo: navigation.getReplaceNerdletLocation(
            this.videoQosNerdlet()
          ),
        },
        { label: 'Client', to: undefined },
        {
          label: 'CDN',
          navigateTo: navigation.getReplaceNerdletLocation(
            this.containerExplorerNerdlet()
          ),
        },
        {
          label: 'Services',
          navigateTo: navigation.getReplaceNerdletLocation(
            this.containerExplorerNerdlet()
          ),
        },
        {
          label: 'Infra Cloud',
          navigateTo: navigation.getReplaceNerdletLocation(
            this.containerExplorerNerdlet()
          ),
        },
      ],
      rows: ['Availability', 'Latency', 'Error Budget', 'Capacity'],
    });
  }

  fetchAlertStatuses(cells) {
    if (!cells) cells = this.state.cells;
    const { fetching } = this.state;
    if (fetching) return;
    const { board, accountId, timeRange } = this.props;

    const { policies, attributes, data } = cells.reduce(
      (a, c) => {
        if (c.policy) a.policies.push("'" + c.policy + "'");
        if (c.details) a.attributes.push(c.details.str);
        return a;
      },
      { policies: [], attributes: [] }
    );

    const timePeriod =
      'SINCE ' +
      (timeRange && timeRange.duration
        ? timeRange.duration / 1000 + ' SECONDS AGO'
        : timeRange.begin_time + ' UNTIL ' + timeRange.end_time);
    const alertsQuery = policies.length
      ? `alerts: nrql(query: "SELECT latest(current_state) AS 'AlertStatus', latest(incident_id) AS 'IncidentId' FROM ${
          board.event
        } WHERE policy_name IN (${policies.join(
          ','
        )}) FACET policy_name, condition_name ${timePeriod} LIMIT MAX") { results }`
      : '';
    const valuesQuery = attributes.length
      ? `values: nrql(query: "SELECT ${attributes.join(', ')} FROM ${
          board.event
        } ${timePeriod}") { results }`
      : '';

    const gql = `{
      actor {
        account(id: ${accountId}) {
          ${alertsQuery}
          ${valuesQuery}
        }
      }
    }`;

    this.setState({
      fetching: true,
    });

    NerdGraphQuery.query({ query: gql })
      .then(this.parseAlertStatuses)
      .catch(err => {
        this.setState({
          fetching: false,
        });
      })
      .finally(() => {
        const timeoutId = setTimeout(this.fetchAlertStatuses, 60000);
        this.setState({
          timeoutId: timeoutId,
        });
      });
  }

  parseAlertStatuses(res) {
    const results = (((res || {}).data || {}).actor || {}).account || {};
    const alertsResults = (results.alerts || {}).results;
    const valuesResults = ((results.values || {}).results || []).shift();

    const alerts = alertsResults
      ? alertsResults.reduce((a, c) => {
          if (c.AlertStatus === 'open')
            a[c.facet[0]] = c.facet[0] in a ? a[c.facet[0]] + 1 : 1;
          return a;
        }, {})
      : {};

    if (valuesResults && 'timestamp' in valuesResults)
      delete valuesResults.timestamp;

    const data = valuesResults
      ? Object.keys(valuesResults).reduce((a, c) => {
          a[c] = valuesResults[c];
          return a;
        }, {})
      : {};

    this.setState({
      data: data,
      alerts: alerts,
      fetching: false,
    });
  }

  humanizeNumber(value, style) {
    if (!value && value != 0) return '';
    value = Number(value);
    if (Number.isNaN(value)) return '';
    const formatter = new Intl.NumberFormat('en-US', {
      style: style || 'decimal',
      maximumFractionDigits: 2,
    });
    if (value < 1000) return formatter.format(value);
    let suffixes = ['', 'k', 'm', 'b', 't'];
    const thousands =
      0 === value ? value : Math.floor(Math.log(value) / Math.log(1000));
    return (
      formatter.format(
        parseFloat((value / Math.pow(1000, thousands)).toFixed(2))
      ) + suffixes[thousands]
    );
  }

  getCellContent(row, col) {
    const { cells, data, alerts } = this.state;

    const match = cells
      .filter(cell => cell.row === row && cell.col === col)
      .shift();

    if (!match) return <span className={'circle unknown'} />;

    if (match.policy) {
      return (
        <span className={'circle ' + (match.policy in alerts ? 'alert' : 'ok')}>
          <Icon
            type={
              match.polity in alerts === 'alert'
                ? Icon.TYPE.INTERFACE__SIGN__CLOSE
                : Icon.TYPE.INTERFACE__SIGN__CHECKMARK
            }
            color="#ffffff"
            className="circle-icon"
          ></Icon>
        </span>
      );
    } else if (match.details) {
      const num = data[match.details.name];
      const status = { class: '' };

      //   if (num && (match.details.is && match.details.value)) {
      //     const { is, value } = match.details;
      //     const comparator = `${num} ${
      //       is === 'more' ? '>' : is === 'less' ? '<' : '=='
      //     } ${value}`;
      //     status.class = eval(comparator) ? 'alert' : 'ok';
      //   }

      const possibilities = ['circle ok', 'circle alert'];
      const randomIndex = Math.floor(
        Math.random() * (possibilities.length - 1 + 1) + 1
      );
      status.class = possibilities[randomIndex - 1];

      return (
        <span className={'text ' + status.class}>
          {this.humanizeNumber(num)}
          <Icon
            type={
              randomIndex > 1
                ? Icon.TYPE.INTERFACE__SIGN__CLOSE
                : Icon.TYPE.INTERFACE__SIGN__CHECKMARK
            }
            color="#ffffff"
            className="circle-icon"
          ></Icon>
        </span>
      );
    }
  }

  render() {
    const { board, rows, cells, cols, detailsForCell } = this.state;
    const { accountId, currentUser } = this.props;

    return (
      <div>
        <div className="board-title">
          <h2>{board.name}</h2>
        </div>
        <table className="board-table">
          <thead>
            <tr>
              <th></th>
              {cols.map(c => {
                const label = c.label;
                return (
                  <th key={label} className="row-header">
                    <div>
                      {c.navigateTo && (
                        <span>
                          <Link to={c.navigateTo}>{label}</Link>
                        </span>
                      )}
                      {!c.navigateTo && <span>{label}</span>}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r}>
                <th className="row-header">{r}</th>
                {cols.map(c => {
                  const label = c.label;
                  return (
                    <td
                      onClick={() => {
                        const matchingCell = cells.find(
                          cell => cell.col === label
                        );
                        if (matchingCell) {
                          const { navigateTo } = matchingCell;
                          if (navigateTo) {
                            navigation.openNerdlet(navigateTo());
                          }
                        }
                        return null;
                      }}
                      key={r + '-' + c.label}
                    >
                      {this.getCellContent(r, c.label)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {detailsForCell && (
          <CellDetails
            board={board}
            accountId={accountId}
            currentUser={currentUser}
            cell={detailsForCell}
          />
        )}
      </div>
    );
  }
}
