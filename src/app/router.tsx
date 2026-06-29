import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import RequireAuth from '@/features/auth/RequireAuth'
import DailyCheckinPage from '@/pages/DailyCheckinPage'
import DashboardPage from '@/pages/DashboardPage'
import ImportExportPage from '@/pages/ImportExportPage'
import MetricsPage from '@/pages/MetricsPage'
import PlanPage from '@/pages/PlanPage'
import SessionBankPage from '@/pages/SessionBankPage'
import SignInPage from '@/pages/SignInPage'
import TrainPage from '@/pages/TrainPage'

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/train" element={<TrainPage />} />
                  <Route path="/sessions" element={<SessionBankPage />} />
                  <Route path="/checkin" element={<DailyCheckinPage />} />
                  <Route path="/metrics" element={<MetricsPage />} />
                  <Route path="/import-export" element={<ImportExportPage />} />
                  <Route path="/plan" element={<PlanPage />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </HashRouter>
  )
}
