import apiConfigs from '../config/ApiConfig'
import platformConfigs from '../config/PlatformConfig'
import userConfigs from '../config/UserConfig'
import videoConfigs from '../config/VideoConfig'

export default [
  userConfigs,
  platformConfigs,
  apiConfigs,
  videoConfigs,
  {
    title: 'Ads',
  },
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
