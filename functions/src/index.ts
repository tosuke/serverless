import * as functions from 'firebase-functions'
import * as config from './config.json'
import { Request } from './type'
import { slack } from './client'

async function slackCommand(req, res): Promise<void> {
  try {
    const request = verifyBody(req.body)

    const task = import(`./${config.commands[request.command].path}`)
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

function verifyBody(body: any): Request {
  if (body != null) {
    const request = body as Request
    if (request.command != null && request.token === config.commands[request.command].token) {
      return request
    }
  }
  throw new Error('invalid credentials')
}

export const slackcmd = functions.https.onRequest(slackCommand)

export const screenshotcmd = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB'
  })
  .https.onRequest(slackCommand)
