import { Button } from '@/app/components/ui/button'
import { db } from '@/db'
import { ApplicationsTable } from '@/app/components/ApplicationsTable'
import { Icon } from '@/app/components/Icon'
import { Prisma } from '@generated/prisma/client'
import { link } from '@/app/shared/links'

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    status: true
    company: {
      include: {
        contacts: true
      }
    }
  }
}>

const List = async ({ request }: { request: Request }) => {
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  console.log({ status })
  const applications = await db.application.findMany({
    include: {
      status: true,
      company: {
        include: {
          contacts: true,
        },
      },
    },
    where: {
      archived: status === 'archived' ? true : false,
    },
  })

  return (
    <div className="px-page-side">
      <div className="flex justify-between items-center mb-5">
        <h1 className="page-title">All Applications</h1>
        <div>
          <Button asChild>
            <a href={link('/applications/new')}>
              <Icon id="plus" />
              New Application
            </a>
          </Button>
        </div>
      </div>
      <div className="mb-8">
        {applications.length > 0 ? (
          <ApplicationsTable applications={applications} />
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No applications found
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-10">
        <Button asChild variant="secondary">
          {status === 'archived' ? (
            <a href={`${link('/applications')}`}>
              <Icon id="archive" />
              Active
            </a>
          ) : (
            <a href={`${link('/applications')}?status=archived`}>
              <Icon id="archive" />
              Archive
            </a>
          )}
        </Button>
        <Button asChild>
          <a href={link('/applications/new')}>
            <Icon id="plus" />
            New Application
          </a>
        </Button>
      </div>
    </div>
  )
}

export { List }
