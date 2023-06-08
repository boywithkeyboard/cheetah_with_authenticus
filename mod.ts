import { GitHub } from 'authenticus'
import cheetah, { Exception } from 'cheetah'
import validator, { z } from 'zod'

// todo: set environment variables: 'client_id', 'client_secret'

const env = {
  client_id: Deno.env.get('client_id') as string,
  client_secret: Deno.env.get('client_secret') as string,
}

const app = new cheetah({
  validator
})

app.get('/oauth2/login', () => {
  return GitHub.getAuthorizeUrl({
    client_id: env.client_id,
    // state: 'a random string to prevent csrf attacks' // optional
  })
})

app.get('/oauth2/callback', {
  query: z.object({
    code: z.string(),
    // state: z.string()
  })
}, async c => {
  // if you've set a state before, you should check if the state in the query is the same as the one you've provided!

  try {
    const { access_token } = await GitHub.getAccessToken({
      client_id: env.client_id,
      client_secret: env.client_secret,
      code: c.req.query.code,
      redirect_uri: 'https://yourdomain.com/oauth2/callback'
    })

    const user = await GitHub.getUser(access_token)

    // do something with the user object
  } catch (_err) {
    throw new Exception('Invalid Auth Code')
  }
})
