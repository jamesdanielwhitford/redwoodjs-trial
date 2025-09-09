# Brief: Cloudflare Workers, Wrangler, and RedwoodSDK

**Writer:** James  
**Customer:** Ritza, maybe RedwoodSDK  

## Overview

[RedwoodSDK](https://rwsdk.com) is a framework that isn't a framework (?).

It's built on [Wrangler](https://developers.cloudflare.com/workers/wrangler/), which is a CLI to manage [Cloudflare Workers](https://workers.cloudflare.com).

## Initial Research

I ran through the [Redwood quickstart guide](https://docs.rwsdk.com/getting-started/quick-start/) and it worked, but I wasn't that clear on what Redwood was doing vs just Cloudflare workers as it all seemed to be wrangler/worker stuff to me.

They also have a more detailed [full-stack app tutorial](https://docs.rwsdk.com/tutorial/full-stack-app/), but it also doesn't really show me the value of Redwood up front.

## Proposed Solution

I think we should build a set of three guides that show:

1. **Traditional Stack**: How to build a full stack app with React and Express and Postgres (traditional full stack app)
2. **Cloudflare Stack**: How to build the same app using Cloudflare workers and Wrangler (serverless full stack app, probably with D1 as a database or something)
3. **RedwoodSDK Stack**: How to build the same app using RedwoodSDK

At that point we'd probably have a good understanding of the problem redwood is solving, and how much simpler it is to use it vs building without it. We could then write the introduction that explains the problems with normal full stack dev, and how cloudflare workers solve that. Then introduce the problems with cloudflare workers and wrangler and how redwood solves that.

## Steps

1. Run through the redwood tutorial
2. Build a similar but probably simpler app with just Express, React, Postgres
3. Build it again with Cloudflare workers and Wrangler
4. Build it again with Redwood
5. Let's discuss the three platforms and an angle before you write the guide