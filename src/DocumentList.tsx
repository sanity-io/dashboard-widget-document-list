import React, {useEffect, useMemo, useState} from 'react'
import {IntentButton, SanityPreview} from 'sanity/_unstable'
import {getPublishedId, useClient, useSchema} from 'sanity'
import {intersection} from 'lodash'
import {getSubscription} from './sanityConnector'
import {SanityDocument} from 'sanity'
import {Card, Flex, Spinner, Stack} from '@sanity/ui'
import {DashboardWidgetContainer} from '@sanity/dashboard'

export interface DocumentListConfig {
  title?: string
  types?: string[]
  query?: string
  queryParams?: Record<string, any>
  order?: string
  limit?: number
  showCreateButton?: boolean
  createButtonText?: string
  apiVersion?: string
}

const defaultProps = {
  title: 'Last created',
  order: '_createdAt desc',
  limit: 10,
  queryParams: {},
  showCreateButton: true,
  apiVersion: 'v1',
}

export function DocumentList(props: DocumentListConfig) {
  const {
    query,
    limit,
    apiVersion,
    queryParams,
    types,
    order,
    title,
    showCreateButton,
    createButtonText,
  } = {
    ...defaultProps,
    ...props,
  }

  const [documents, setDocuments] = useState<SanityDocument[] | undefined>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>()

  const client = useClient()
  const schema = useSchema()
  const versionedClient = useMemo(() => client.withConfig({apiVersion}), [client, apiVersion])

  const {assembledQuery, params} = useMemo(() => {
    if (query) {
      return {assembledQuery: query, params: queryParams}
    }

    const documentTypes = schema.getTypeNames().filter((typeName) => {
      const schemaType = schema.get(typeName)
      return schemaType.type && schemaType.type.name === 'document'
    })

    return {
      assembledQuery: `*[_type in $types] | order(${order}) [0...${limit * 2}]`,
      params: {types: types ? intersection(types, documentTypes) : documentTypes},
    }
  }, [schema, query, queryParams, order, limit, types])

  useEffect(() => {
    if (!assembledQuery) {
      return
    }

    const subscription = getSubscription(assembledQuery, params, versionedClient).subscribe({
      next: (d) => {
        setDocuments(d.slice(0, limit))
        setLoading(false)
      },
      error: (e) => {
        setError(e)
        setLoading(false)
      },
    })
    // eslint-disable-next-line consistent-return
    return () => {
      subscription.unsubscribe()
    }
  }, [limit, versionedClient, assembledQuery, params])

  return (
    <DashboardWidgetContainer
      header={title}
      footer={
        types &&
        types.length === 1 &&
        showCreateButton && (
          <IntentButton
            mode="bleed"
            style={{width: '100%'}}
            paddingX={2}
            paddingY={4}
            tone="primary"
            type="button"
            intent="create"
            params={{type: types[0]}}
            text={createButtonText || `Create new ${types[0]}`}
          />
        )
      }
    >
      <Card>
        {error && <div>{error.message}</div>}
        {!error && loading && (
          <Card padding={4}>
            <Flex justify="center">
              <Spinner muted />
            </Flex>
          </Card>
        )}
        {!error && !documents && !loading && <div>Could not locate any documents :/</div>}
        <Stack space={2}>
          {documents && documents.map((doc) => <MenuEntry key={doc._id} doc={doc} />)}
        </Stack>
      </Card>
    </DashboardWidgetContainer>
  )
}

function MenuEntry({doc}: {doc: SanityDocument}) {
  const schema = useSchema()
  const type = schema.get(doc._type)
  return (
    <Card flex={1}>
      <IntentButton
        intent="edit"
        mode="bleed"
        padding={1}
        radius={0}
        params={{
          type: doc._type,
          id: getPublishedId(doc._id),
        }}
        style={{width: '100%'}}
      >
        <SanityPreview layout="default" schemaType={type} value={doc} key={doc._id} />
      </IntentButton>
    </Card>
  )
}

export default DocumentList
