import sanityClient from 'part:@sanity/base/client'

const getSubscription = (query, params) => sanityClient.listen(query, params, {events: ['create']})

const performQuery = (query, params) => sanityClient.fetch(query, params)

module.exports = {
  getSubscription, performQuery
}
