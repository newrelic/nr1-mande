import apiConfigs from '../config/ApiConfig'
import clientConfigs from '../config/ClientConfig'
import userConfigs from '../config/UserConfig'
import videoConfigs from '../config/VideoConfig'

export default [
  userConfigs,
  clientConfigs,
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
