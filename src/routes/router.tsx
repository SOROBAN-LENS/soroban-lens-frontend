import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import { MarketingLayout } from '../layouts/MarketingLayout'
import { AnalyzePage } from '../pages/AnalyzePage'
import { DashboardPage } from '../pages/DashboardPage'
import { DocsPage } from '../pages/DocsPage'
import { LandingPage } from '../pages/LandingPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ReportPage } from '../pages/ReportPage'
import { RouteErrorPage } from '../pages/RouteErrorPage'
import { SampleReportPage } from '../pages/SampleReportPage'
import { SettingsPage } from '../pages/SettingsPage'

export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <MarketingLayout />,
        children: [{ index: true, element: <LandingPage /> }],
      },
      {
        path: 'app',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'analyze', element: <AnalyzePage /> },
          // Static segment wins over :id, so the sample never hits the backend.
          { path: 'reports/sample', element: <SampleReportPage /> },
          { path: 'reports/:id', element: <ReportPage /> },
          { path: 'docs', element: <DocsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage standalone /> },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}

/** Used by tests to render any route without a browser history. */
export function createTestRouter(initialPath: string) {
  return createMemoryRouter(routes, { initialEntries: [initialPath] })
}
