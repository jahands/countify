export const routes = {
  v1: {
    counter: {
      /** Matches all actions for a namespace/name */
      all: '/:action/:namespace/:name',
      /** Creates a new counter in a namespace */
      new: '/new/:namespace/:name',
      /** Gets the value of a counter */
      get: '/get/:namespace/:name',
      /** Increments a counter */
      inc: '/inc/:namespace/:name',
    }
  }
} as const
