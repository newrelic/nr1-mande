import { openVideoSession } from '../../../utils/navigation'

const hooks = [
  {
    name: 'openSession',
    handler({ data, metadata }) {
      if (!this || !this.accountId || !this.stack.title)
        throw `This handler's this context must be bound to the calling props`

      openVideoSession(this.accountId, metadata.name, this.stack.title)
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
