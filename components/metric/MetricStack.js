import React from 'react'
import { Stack, StackItem, Link } from 'nr1'
import { Metric, BlankMetric } from './Metric'

const metricStack = props => {
  const {
    config,
    accountId,
    duration,
    threshold,
    selected,
    selectMetric,
  } = props

  let minify = selected !== null && !selected
  let metrics = null

  if (!selected) {
    metrics =
      config.metrics &&
      config.metrics
        .map(metric => {
          return [...Array(config.metrics)].map((_, idx) => {
            return (
              <React.Fragment key={metric.title + idx}>
                {metric.query && (
                  <Metric
                    accountId={accountId}
                    metric={metric}
                    duration={duration}
                    threshold={threshold}
                    minify={minify}
                    click={selectMetric}
                  />
                )}
              </React.Fragment>
            )
          })
        })
        .reduce((arr, val) => {
          return arr.concat(val)
        }, [])

    if (!metrics && threshold === 'All')
      metrics = (
        <React.Fragment>
          <StackItem
            className={minify ? 'metric minified' : 'metric maximized'}
          >
            <BlankMetric minified={minify} />
          </StackItem>
        </React.Fragment>
      )
  }

  return (
    <React.Fragment>
      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        gapType={Stack.GAP_TYPE.MEDIUM}
        className="metricStack"
      >
        <StackItem
          className={selected ? 'metric title selectedStack' : 'metric title'}
        >
          {config.navigateTo && (
            <span>
              <Link to={config.navigateTo}>{config.title}</Link>
              {/* <Link onClick={}>{config.title}</Link> */}
            </span>
          )}
          {!config.navigateTo && config.title}
        </StackItem>
        {minify && (
          <Stack directionType={Stack.DIRECTION_TYPE.HORIZONTAL}>
            {!metrics ? (
              <StackItem>
                <div></div>
              </StackItem>
            ) : (
              metrics
            )}
          </Stack>
        )}
        {!minify &&
          (!metrics ? (
            <StackItem>
              <div></div>
            </StackItem>
          ) : (
            metrics
          ))}
      </Stack>
    </React.Fragment>
  )
}

export default metricStack
