import apiConfigs from './ApiConfig'
import clientConfigs from './ClientConfig'
import userConfigs from './UserConfig'
import videoConfigs from './VideoConfig'
import adConfigs from './AdConfig'
import sourceConfigs from './AwsSourceConfig'
import ingestConfigs from './AwsIngestConfig'
import processConfigs from './AwsProcessConfig'
import publishConfigs from './AwsPublishConfig'
import originConfigs from './AwsOriginConfig'
import cdnConfigs from './AwsCdnConfig'

export default [
  userConfigs,
  clientConfigs,
  apiConfigs,
  videoConfigs,
  adConfigs,
  cdnConfigs,
  originConfigs,
  publishConfigs,
  processConfigs,
  ingestConfigs,
  sourceConfigs,
]

export const FIND_USER_ATTRIBUTE = 'tvAccount'
