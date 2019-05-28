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

_Note_: If a document in the result (as returned by the backend) has a draft, that draft is rendered instead of the published document.

There are some options available:

### `title` (string)

Widget title

```js
{
  name: 'document-list',
  options: {
    title: 'Some documents'
  }
}
```

### `order` (string)

Field and direction to order by when docs are rendered

```js
{
  name: 'document-list',
  options: {
    title: 'Last edited',
    order: '_updatedAt desc'
  }
}
```

### `limit` (number)

Number of docs rendered

```js
{
  name: 'document-list',
  options: {
    title: 'Last edited',
    order: '_updatedAt desc',
    limit: 3
  }
}
```

### `types` (array)

Array of strings signifying which document (schema) types are fetched

```js
{
  name: 'document-list',
  options: {
    title: 'Last edited',
    order: '_updatedAt desc',
    types: ['book', 'author']
  }
}
```

### `query` (string) and `queryParams` (object)

Customized GROQ query with params for maximum control. If you use the query option, the `types`, `order`, and `limit` options will cease to function. You're on your own. You should also make sure to provide an `apiVersion` parameter.

```js
{
  name: 'document-list',
  options: {
    title: 'Published books by title',
    apiVersion: '2019-05-28',
    query: '*[_type == "book" && published == true] | order(title asc) [0...10]',
  }
}
```

```js
{
  name: 'document-list',
  options: {
    title: 'My favorite documents',
    apiVersion: '2019-05-28',
    query: '*[_id in $ids]',
    queryParams: {
      ids: ['ab2', 'c5z', '654']
    },
  }
}
```
