import { openVideoSession } from './navigation'

const hooks = [
  {
    name: 'openSession',
    handler({ data, metadata }) {
      if (!this || !this.accountId)
        console.error(
          `This handler's this context must be bound to the calling props`
        )

      openVideoSession(this.accountId, metadata.name)
    },
  },
  {
    name: 'filter',
    handler({ data, metadata }) {
      if (!this) console.error(`Please bind the appropriate this context`)

      if (!this.facetContext)
        console.error(
          `A FilterFacetContext is expected to be found in the bound this context`
        )

      const filterGroups = metadata.groups.filter(
        group => group.type === 'facet'
      )

      this.facetContext.updateFilterGroup(filterGroups)
    },
  },
  {
    name: 'doNothing',
    handler() {},
  },
]

export const getHook = name => {
  const hook = hooks.filter(h => h.name === name)[0]
  if (!hook) return () => null
  else {
    return hook.handler
  }
}
