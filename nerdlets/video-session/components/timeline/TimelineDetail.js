import React from 'react'

import { NrqlQuery } from 'nr1'
import EventStream from './EventStream'
import Timeline from '../timeline/Timeline'
import videoGroup from './VideoGroup'
import { activeEvents } from '../../../shared/config/VideoConfig'

export default class TimelineDetail extends React.Component {
  state = {
    sessionData: [],
    loading: true,
    legend: [],
  }

  getData = async () => {
    const { accountId, session, duration } = this.props

    const query = `SELECT * from ${activeEvents()} WHERE viewId = '${session}' ORDER BY timestamp ASC LIMIT 1000 ${duration.since}`

    const { data } = await NrqlQuery.query({ accountId, query })

    let result = []
    if (data && data.chart.length > 0) result = data.chart[0].data

    return result
  }

  getLegend = data => {
    const legend = []
    for (let row of data) {
      const group = videoGroup(row.actionName)
      const found = legend.filter(item => item.group.name === group.name)

      if (found.length === 0) {
        legend.push({ group, visible: true })
      }
    }

    return legend
  }

  onClickLegend = legendItem => {
    const legend = [...this.state.legend]

    let hiddenCount = 0

    legend.forEach(item => {
      if (item.group.name !== legendItem.group.name && !item.visible)
        hiddenCount++
    })

    if (legendItem.visible && hiddenCount === 0) {
      legend.forEach(item => {
        if (item.group.name !== legendItem.group.name) item.visible = false
      })
    } else if (legendItem.visible && hiddenCount === legend.length - 1) {
      legend.forEach(item => {
        if (item.group.name !== legendItem.group.name) item.visible = true
      })
    } else {
      for (let item of legend) {
        if (item.group.name === legendItem.group.name) {
          item.visible = !legendItem.visible
          break
        }
      }
    }

    this.setState({ legend })
  }

  async componentDidMount() {
    const data = await this.getData()
    const legend = this.getLegend(data)
    this.setState({ sessionData: data, loading: false, legend })
  }

  render() {
    const { sessionData, loading, legend } = this.state

    return (
      <React.Fragment>
        <Timeline
          data={sessionData}
          loading={loading}
          legend={legend}
          legendClick={this.onClickLegend}
        />
        <EventStream data={sessionData} loading={loading} legend={legend} />
      </React.Fragment>
    )
  }
}
