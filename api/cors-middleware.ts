import Cors from 'cors';
import type { NextApiRequest, NextApiResponse } from 'next'

export const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: true
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}