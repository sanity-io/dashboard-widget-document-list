# dashboard-widget-document-list
Dashboard widget for the Sanity Content Studio which displays a list of documents



## Usage
Assuming you already have a functional Dashboard in your Sanity Content Studio.

1. Install this widget in your Studio folder like so:

```
sanity install dashboard-widget-document-list
```

2. Update your `src/dashboardConfig.js` file by adding `{name: 'document-list'}` to the `widgets` array
3. Restart your Studio

There are some options available:

### `title` (string)
Widget title

```js
{name: 'document-list', options: {title: 'Some documents'}}
```

### `order` (string)
Field and direction to order by when docs are rendered

```js
{name: 'document-list', options: {title: 'Last edited', order: '_updatedAt desc'}}
```

### `limit` (number)
Number of docs rendered

```js
{name: 'document-list', options: {title: 'Last edited', order: '_updatedAt desc', limit: 3}}
```

### `types` (array)
Array of strings signifying which document (schema) types are fetched

```js
{name: 'document-list', options: {title: 'Last edited', order: '_updatedAt desc', types: ['book', 'author']}}
```

### `overlayDrafts` (boolean)
Show drafts in place of published documents (default: `true`). If set to `true`, documents in the list will have their drafts fetched and rendered instead. If set to `false`, documents (drafts and non-drafts alike) are just rendered in the order they are retrieved.

```js
{name: 'document-list', options: {title: 'Fresh stuff', order: '_createdAt desc', overlayDrafts: false}}
```

### `query` (string) and `params` (object)
Customized GROQ query with params for maximum control. If you use the query option, the `types`, `order`, `limit` and `overlayDrafts`, options will cease to function. You're on your own.

```js
{name: 'document-list', options: {title: 'Published books by title', query: '*[_type == "book" && published == true] | order(title asc) [0...10]'}}
```

```js
{name: 'document-list', options: {title: 'My favorite documents', query: '*[_id in $ids]', params: {ids: ['ab2', 'c5z', '654']}}}
```
