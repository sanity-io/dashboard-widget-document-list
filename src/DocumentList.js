import React from 'react'
import PropTypes from 'prop-types'
import {IntentLink} from 'part:@sanity/base/router'
import SanityPreview from 'part:@sanity/base/preview'
import Spinner from 'part:@sanity/components/loading/spinner'
import schema from 'part:@sanity/base/schema'
import IntentButton from 'part:@sanity/components/buttons/intent'
import {List, Item} from 'part:@sanity/components/lists/default'
import {intersection} from 'lodash'
import {getSubscription, performQuery} from './sanityConnector'
import styles from './DocumentList.css'

const schemaTypeNames = schema.getTypeNames()

function prepareDocumentList(incoming, overlayDrafts) {
  if (!incoming) {
    return Promise.resolve([])
  }
  const documents = Array.isArray(incoming) ? incoming : [incoming]

  if (!overlayDrafts) {
    return Promise.resolve(documents)
  }
  const ids = documents
    .filter(doc => !doc._id.startsWith('drafts.'))
    .map(doc => `drafts.${doc._id}`)
  return performQuery('*[_id in $ids]', {ids}).then(drafts => {
    const outgoing = documents.map(doc => {
      const foundDraft = drafts.find(draft => draft._id === `drafts.${doc._id}`)
      return foundDraft || doc
    })
    return outgoing
  })
}


class DocumentList extends React.Component {

  state = {
    documents: null
  }

  static propTypes = {
    title: PropTypes.string,
    types: PropTypes.arrayOf(PropTypes.string),
    query: PropTypes.string,
    queryParams: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    order: PropTypes.string,
    limit: PropTypes.number,
    overlayDrafts: PropTypes.boolean
  }

  static defaultProps = {
    title: 'Last created',
    order: '_createdAt desc',
    overlayDrafts: true,
    limit: 10,
    types: null,
    query: null,
    queryParams: {}
  }

  componentDidMount = () => {
    const {query, overlayDrafts} = this.props
    const {assembledQuery, params} = this.assembleQuery()
    console.log('query/params', assembledQuery, params)

    if (!assembledQuery) {
      return
    }

    this.unsubscribe()
    this.subscription = getSubscription(assembledQuery, params).subscribe(event => {
      console.log('event.result', event.result)

      // Substitute documents for drafts if overlayDrafts prop is set
      // Or if query prop is present
      // in which case we assume the Studio knows what it's doing
      prepareDocumentList(event.result, overlayDrafts || !!query).then(documents => {
        console.log('prepared documents', documents)
        this.setState({documents})
      })
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  assembleQuery = () => {
    const {query, queryParams, types, order, limit} = this.props
    if (query) {
      return {assembledQuery: query, params: queryParams}
    }

    const documentTypes = schemaTypeNames.filter(typeName => {
      const schemaType = schema.get(typeName)
      return schemaType.type && schemaType.type.name === 'document'
    })

    if (types) {
      return {
        assembledQuery: `*[_type in $types] | order(${order}) [0...${limit}]`,
        params: {types: intersection(types, documentTypes)}
      }
    }

    return {
      assembledQuery: `*[_type in $types] | order(${order}) [0...${limit}]`,
      params: {types: documentTypes}
    }
  }


  render() {
    const {title, types} = this.props
    const {documents, loading} = this.state

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </header>
        <div className={styles.content}>
          {loading && <Spinner center message="Loading items…" />}
          <List>
            {documents.map(doc => {
              const type = schema.get(doc._type)
              return (
                <Item key={doc._id}>
                  <IntentLink
                    intent="edit"
                    params={{
                      type: doc._type,
                      id: doc._id
                    }}
                    className={styles.link}
                  >
                    <SanityPreview layout="default" type={type} value={doc} key={doc._id} />
                  </IntentLink>
                </Item>
              )

            })}
          </List>
        </div>
        {types && types.length === 1 && (
          <div className={styles.footer}>
            <IntentButton bleed color="primary" kind="simple" intent="create" params={{type: types[0]}}>
              Create new {types[0]}
            </IntentButton>
          </div>
        )}
      </div>
    )
  }
}

export default DocumentList
