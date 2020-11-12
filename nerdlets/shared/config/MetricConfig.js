import apiConfigs from './ApiConfig'
import deviceConfigs from './DeviceConfig'
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
  deviceConfigs,
  videoConfigs,
  adConfigs,
  apiConfigs,
  cdnConfigs,
  originConfigs,
  publishConfigs,
  processConfigs,
  ingestConfigs,
  sourceConfigs,
]

export const FIND_USER_ATTRIBUTE = ['userId'] // ['tvAccount', 'aisuid']
