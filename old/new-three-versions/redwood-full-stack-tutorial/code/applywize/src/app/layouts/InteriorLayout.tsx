import { type LayoutProps } from 'rwsdk/router'
import { Header } from '@/app/components/Header'

const InteriorLayout = ({ children }: LayoutProps) => {
  return (
    <div className="page-wrapper">
      <main className="page bg-white">
        <Header />
        <div>{children}</div>
      </main>
    </div>
  )
}

export { InteriorLayout }
