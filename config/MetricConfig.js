import apiConfigs from './ApiConfig'
import clientConfigs from './ClientConfig'
import userConfigs from './UserConfig'
import videoConfigs from './VideoConfig'
import adConfigs from './AdConfig'
import sourceConfigs from './SourceConfig'
import ingestConfigs from './IngestConfig'
import processConfigs from './ProcessConfig'
import publishConfigs from './PublishConfig'
import originConfigs from './OriginConfig'

export default [
  userConfigs,
  clientConfigs,
  apiConfigs,
  videoConfigs,
  adConfigs,
  {
    title: 'Deliver - CDN',
  },
  originConfigs,
  publishConfigs,
  processConfigs,
  ingestConfigs,
  sourceConfigs
]
