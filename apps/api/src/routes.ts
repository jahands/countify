export const routes = {
  v1: {
    counter: {
      /** Matches all actions for a namespace/name */
      all: '/:action/:namespace/:name',
      new: '/new/:namespace/:name',
      get: '/get/:namespace/:name',
      inc: '/inc/:namespace/:name',
    }
  }
} as const
