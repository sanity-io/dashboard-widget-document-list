import DocumentList, {DocumentListConfig} from './DocumentList'
import React from 'react'
import {LayoutConfig, DashboardWidget} from '@sanity/dashboard'

export interface DocumentListWidgetConfig extends DocumentListConfig {
  layout?: LayoutConfig
}

export function documentListWidget(config: DocumentListWidgetConfig): DashboardWidget {
  return {
    name: 'document-list-widget',
    component: function component() {
      return <DocumentList {...config} />
    },
    layout: config.layout,
  }
}
