import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import DailyCheckinPage from '@/pages/DailyCheckinPage'
import DashboardPage from '@/pages/DashboardPage'
import ImportExportPage from '@/pages/ImportExportPage'
import MetricsPage from '@/pages/MetricsPage'
import PlanPage from '@/pages/PlanPage'
import SessionBankPage from '@/pages/SessionBankPage'
import TrainPage from '@/pages/TrainPage'

export default function Router() {
  return (
    <HashRouter>
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
    </HashRouter>
  )
}
