import React from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from 'react-select/async'
import { sortBy } from 'lodash'

import { HeadingText, NerdGraphQuery, Stack, StackItem } from 'nr1'
import { FIND_USER_ATTRIBUTE } from '../../../../config/MetricConfig'

const searchBar = props => {
  const loadData = async searchTerm => {
    console.debug('searchBar.loadData')

    const { duration, accountId } = props
    const nrql = `FROM PageAction, MobileVideo, RokuVideo SELECT uniques(${FIND_USER_ATTRIBUTE}) WHERE userId like '%${searchTerm}%' ${duration.since} `

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

    if (rawData)
      results = rawData.actor.account.nrql.results[0][`uniques.${FIND_USER_ATTRIBUTE}`]

    results = sortBy(results)
    results = results.map(r => {
      return { label: r, value: r }
    })

    console.debug('searchBarContainer.loadData results', results)

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
