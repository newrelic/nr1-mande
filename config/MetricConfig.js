import apiConfigs from './ApiConfig'
import clientConfigs from './ClientConfig'
import userConfigs from './UserConfig'
import videoConfigs from './VideoConfig'
import adConfigs from './AdConfig'
import sourceConfigs from './SourceConfig'
import ingestConfigs from './IngestConfig'
import processConfigs from './ProcessConfig'

export default [
  userConfigs,
  clientConfigs,
  apiConfigs,
  videoConfigs,
  adConfigs,
  {
    title: 'Deliver - CDN',
  },
  {
    title: 'Deliver - Origin',
  },
  processConfigs,
  ingestConfigs,
  sourceConfigs
]
