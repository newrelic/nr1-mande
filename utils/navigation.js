import { navigation } from 'nr1'

export const openFindUser = (accountId, user) => {
  navigation.openStackedNerdlet({
    id: 'find-user',
    urlState: { accountId, user },
  })
}

export const openUserVideoViews = (accountId, user, session, views, scope) => {
  navigation.openStackedNerdlet({
    id: 'user-video-view',
    urlState: { accountId, user, session, views, scope },
  })
}

export const openVideoSession = (accountId, session, stackName) => {
  navigation.openStackedNerdlet({
    id: 'video-session',
    urlState: { accountId, session, stackName },
  })
}
