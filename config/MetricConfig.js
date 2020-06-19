import apiConfigs from './ApiConfig'
import clientConfigs from './ClientConfig'
import userConfigs from './UserConfig'
import videoConfigs from './VideoConfig'
import adConfigs from './AdConfig'
import sourceConfigs from './SourceConfig'
import ingestConfigs from './IngestConfig'

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
  ingestConfigs,
  sourceConfigs
]
