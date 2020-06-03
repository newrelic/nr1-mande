import apiConfigs from './ApiConfig'
import clientConfigs from './ClientConfig'
import userConfigs from './UserConfig'
import videoConfigs from './VideoConfig'
import adConfigs from './AdConfig'

export default [
  userConfigs,
  clientConfigs,
  apiConfigs,
  videoConfigs,
  adConfigs,
  {
    title: 'CDN',
  },
  {
    title: 'Origin/Packaging',
  },
  {
    title: 'Ingest/Encode',
  },
  {
    title: 'Content/Source',
  },
]
