import { navigation } from 'nr1'

const hooks = [
  {
    name: 'openSession',
    handler({ data, metadata }) {
      // console.debug('hooks openSession this', this)
      // console.debug('data and metadata on click', data, metadata)

      if (!this || !this.accountId || !this.stack.title)
        throw `This handler's this context must be bound to the calling props`

      navigation.openStackedNerdlet({
        id: 'video-session',
        urlState: {
          accountId: this.accountId,
          session: metadata.name,
          stackName: this.stack.title,
        },
      })
    },
  },
]

export const getHook = name => {
  const hook = hooks.filter(h => h.name === name)[0]
  if (!hook) return () => null
  else {
    return hook.handler
  }
}
