import { AccountStorageQuery, AccountStorageMutation } from 'nr1'
import * as metricConfigsDefault from '../config/MetricConfig'

let configs = []
const collection = 'metricConfigs'

export const loadMetricsConfigs = async (accountId, type) => {
  let metricConfigs
  // UNCOMMENT BELOW SECTION TO DELETE CONFIGS FROM NERDSTORE
  // const del = await AccountStorageMutation.mutate({
  //   accountId,
  //   actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
  //   collection,
  // })

  if (configs.length) {
    console.log('loading configs from memory')
    metricConfigs = configs
  } else {
    const { data: configStorageCollection } = await AccountStorageQuery.query({
      accountId,
      collection,
    })
    if (configStorageCollection.length) {
      console.log('loading configs from nerdstore')
      configs = configStorageCollection.map(doc => doc.document)
      metricConfigs = configs
    } else {
      console.log('loading configs from defaults')
      configs = metricConfigsDefault.default
      console.log(configs)
      configs.map(
        async (config, idx) =>
          await AccountStorageMutation.mutate({
            accountId,
            actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
            collection,
            documentId: `doc${idx}`,
            document: config,
          })
      )
      metricConfigs = configs
    }
  }
  
  return type
    ? metricConfigs.filter(conf => conf.title === type)[0]
    : metricConfigs
}
