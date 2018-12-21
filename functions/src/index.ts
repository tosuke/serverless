import * as functions from 'firebase-functions'
import * as config from './config.json'
import { Request } from './type'
import { slack } from './client'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

async function sleep(ms: number): Promise<void> {
  return new Promise(res => {
    setTimeout(res, ms)
  })
}

function lazy(path: string) {
  return async (req, res) => {
    try {
      const request = verifyBody(req.body)

      const task = import(path)
        .then(a => a.default || a)
        .then(f => f(request))

      const result = await task
      if (result) {
        if (result.responseType === 'ephemeral') {
          await slack.chat.postEphemeral({
            channel: request.channel_id,
            user: request.user_id,
            ...result 
          })
        } else {
          await slack.chat.postMessage({
            channel: request.channel_id,
            ...result
          })
        }
      }
      res.end()
    } catch (err) {
      console.error(err)
      res.json({
        text: err.toString()
      })
    }
  }
}

function verifyBody(body: any): Request {
  if (body != null) {
    const request = body as Request
    if (request.command != null && request.token === config.commands[request.command].TOKEN) {
      return request
    }
  }
  throw new Error('invalid credentials')
}

export const gisou = functions.https.onRequest(lazy('./gisou'))