import { Toaster } from '@/components/ui/sonner'
import NavBar from './NavBar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24 md:pb-6">{children}</main>
      <Toaster />
    </div>
  )
}
