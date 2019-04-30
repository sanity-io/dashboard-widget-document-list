import {switchMap} from 'rxjs/operators'
import {uniqBy} from 'lodash'
import sanityClient from 'part:@sanity/base/client'


const draftId = nonDraftDoc => `drafts.${nonDraftDoc._id}`

const prepareDocumentList = (incoming, overlayDrafts) => {
  if (!incoming) {
    return Promise.resolve([])
  }
  const documents = Array.isArray(incoming) ? incoming : [incoming]

  if (!overlayDrafts) {
    return Promise.resolve(documents)
  }
  const ids = documents
    .filter(doc => !doc._id.startsWith('draft.'))
    .map(draftId)

  return sanityClient.fetch('*[_id in $ids]', {ids}).then(drafts => {
    const outgoing = documents.map(doc => {
      const foundDraft = drafts.find(draft => draft._id === draftId(doc))
      return foundDraft || doc
    })
    return uniqBy(outgoing, '_id')
  })
}

const getSubscription = (query, params, overlayDrafts) =>
  sanityClient
    .listen(query, params, {events: ['welcome', 'mutation'], includeResult: false, visibility: 'query'})
    .pipe(switchMap(event => {
      return sanityClient.fetch(query, params).then(incoming => {
        return prepareDocumentList(incoming, overlayDrafts)
      })
    }))


module.exports = {
  getSubscription
}
