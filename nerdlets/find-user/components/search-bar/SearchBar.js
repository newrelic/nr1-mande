import React from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from 'react-select/async'
import { sortBy } from 'lodash'

import { HeadingText, NerdGraphQuery, Stack, StackItem } from 'nr1'
import { FIND_USER_ATTRIBUTE } from '../../../shared/config/MetricConfig'
import { activeEvents } from '../../../shared/config/VideoConfig'

const searchBar = props => {
  const loadData = async searchTerm => {
    console.debug('searchBar.loadData')

    const { duration, accountId } = props

    let userClause = ''
    let userCondition = ''
    FIND_USER_ATTRIBUTE.forEach(u => {
      if (userClause) userClause += ' OR '
      if (userCondition) userCondition += ','

      userCondition += `uniques(${u})`
      userClause += `${u} like '%${searchTerm}%'`
    })
    const nrql = `FROM ${activeEvents()} SELECT ${userCondition} WHERE ${userClause} ${duration.since} LIMIT MAX `

    console.debug('searchBar.loadData nrql', nrql)

    const query = `{
      actor {
        account(id: ${accountId}) {
          nrql(query: "${nrql}") {
            results
          }
        }
      }
    }`

    let queryRunning = true
    let rawData = {}
    let results = []

    while (queryRunning) {
      const { loading, data } = await NerdGraphQuery.query({ query })
      if (!loading) {
        queryRunning = false
        rawData = data
      }
    }

    if (rawData) {
      const uniques = rawData.actor.account.nrql.results[0]
      FIND_USER_ATTRIBUTE.forEach(u => {
        results = results.concat(uniques[`uniques.${u}`])
      })
    }

    results = sortBy(results)
    results = results.map(r => {
      return { label: r, value: r }
    })

    return results
  }

  const handleChange = selectedItem => {
    const val = selectedItem ? selectedItem.value : null
    props.selectUser(val)
  }

  return (
    <Stack
      fullWidth
      horizontalType={Stack.HORIZONTAL_TYPE.FILL}
      directionType={Stack.DIRECTION_TYPE.VERTICAL}
    >
      <div className="search-bar-container">
        <StackItem>
          <HeadingText
            className="panel-header"
            type={HeadingText.TYPE.HEADING_4}
          >
            Search for user
          </HeadingText>
        </StackItem>
        <StackItem>
          <AsyncSelect
            autoFocus
            isClearable={true}
            className="search-bar-select"
            placeholder="Start typing the user identifier ..."
            cacheOptions
            onChange={handleChange}
            loadOptions={loadData}
          />
        </StackItem>
      </div>
    </Stack>
  )
}

export default searchBar

searchBar.propTypes = {
  duration: PropTypes.object.isRequired,
  accountId: PropTypes.number.isRequired,
  selectUser: PropTypes.func.isRequired,
}
