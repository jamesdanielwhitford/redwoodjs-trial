import { defineApp, ErrorResponse } from 'rwsdk/worker'
import { route, render, prefix, layout, index } from 'rwsdk/router'
import { Document } from '@/app/Document'
import { Home } from '@/app/pages/Home'
import { setCommonHeaders } from '@/app/headers'
import { userRoutes } from '@/app/pages/user/routes'
import { sessions, setupSessionStore } from './session/store'
import { Session } from './session/durableObject'
import { type User, db, setupDb } from '@/db'
import { env } from 'cloudflare:workers'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { InteriorLayout } from '@/app/layouts/InteriorLayout'
export { SessionDurableObject } from './session/durableObject'
import { List } from './app/pages/applications/List'

export type AppContext = {
  session: Session | null
  user: User | null
}

const isAuthenticated = ({ ctx }: { ctx: AppContext }) => {
  if (!ctx.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/user/login' },
    })
  }
}

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    await setupDb(env)
    setupSessionStore(env)

    try {
      ctx.session = await sessions.load(request)
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, headers)
        headers.set('Location', '/user/login')

        return new Response(null, {
          status: 302,
          headers,
        })
      }

      throw error
    }

    if (ctx.session?.userId) {
      ctx.user = await db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
      })
    }
  },
  render(Document, [
    index([isAuthenticated, Home]),
    layout(AuthLayout, [prefix('/user', userRoutes)]),
    route('/legal/privacy', () => <h1>Privacy Policy</h1>),
    route('/legal/terms', () => <h1>Terms of Service</h1>),
    layout(
      InteriorLayout,
      prefix('/applications', [
        isAuthenticated,
        route('/', List),
        route('/new', () => <h1>New Application</h1>),
        route('/:id', () => <h1>Applications</h1>),
      ])
    ),
  ]),
])
