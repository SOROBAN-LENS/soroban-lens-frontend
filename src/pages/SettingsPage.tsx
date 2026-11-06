import { useQueryClient } from '@tanstack/react-query'
import { useId, useState, type FormEvent } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { FieldLabel, Input, Select, Toggle } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { useAnalysisHistory } from '../hooks/useAnalysisHistory'
import { useApiInfo, useBackendHealth } from '../hooks/useBackendStatus'
import { useSettings } from '../hooks/useSettings'
import { env } from '../services/config'
import { clearHistory } from '../services/historyStore'
import { MAX_TIMEOUT_MS, MIN_TIMEOUT_MS, defaultSettings, resolveApiBaseUrl } from '../services/settingsStore'
import { NETWORKS, type StellarNetwork } from '../types/api'
import type { ThemePreference } from '../types/settings'
import { networkLabel } from '../utils/labels'
import { validateBaseUrl } from '../utils/validation'

function ConnectionCard() {
  const id = useId()
  const { settings, updateSettings } = useSettings()
  const queryClient = useQueryClient()
  const [baseUrl, setBaseUrl] = useState(settings.apiBaseUrl)
  const [timeoutSec, setTimeoutSec] = useState(String(settings.requestTimeoutMs / 1000))
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const health = useBackendHealth()
  const info = useApiInfo()

  function save(event: FormEvent) {
    event.preventDefault()
    const url = validateBaseUrl(baseUrl)
    if (!url.valid) return setError(url.reason)
    const ms = Math.round(Number(timeoutSec) * 1000)
    if (!Number.isFinite(ms) || ms < MIN_TIMEOUT_MS || ms > MAX_TIMEOUT_MS) {
      return setError(`Timeout must be between ${MIN_TIMEOUT_MS / 1000} and ${MAX_TIMEOUT_MS / 1000} seconds.`)
    }
    setError(null)
    updateSettings({ apiBaseUrl: baseUrl.trim().replace(/\/+$/, ''), requestTimeoutMs: ms })
    void queryClient.invalidateQueries({ queryKey: ['health'] })
    void queryClient.invalidateQueries({ queryKey: ['api-info'] })
    setSaved(true)
  }

  const effective = resolveApiBaseUrl(settings) || 'same origin (dev proxy)'

  return (
    <Card>
      <CardHeader title="Backend connection" description="Where the frontend sends API requests." />
      <CardBody>
        <form onSubmit={save} noValidate className="space-y-4">
          <div>
            <FieldLabel htmlFor={`${id}-url`} hint={env.apiBaseUrl ? `Build default: ${env.apiBaseUrl}` : 'Empty = same origin'}>
              API base URL
            </FieldLabel>
            <Input
              id={`${id}-url`}
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value)
                setSaved(false)
              }}
              placeholder="http://localhost:8080"
              className="font-mono text-[13px]"
              spellCheck={false}
            />
          </div>
          <div className="max-w-48">
            <FieldLabel htmlFor={`${id}-timeout`}>Request timeout (seconds)</FieldLabel>
            <Input
              id={`${id}-timeout`}
              type="number"
              min={MIN_TIMEOUT_MS / 1000}
              max={MAX_TIMEOUT_MS / 1000}
              value={timeoutSec}
              onChange={(e) => {
                setTimeoutSec(e.target.value)
                setSaved(false)
              }}
            />
          </div>
          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit">Save connection</Button>
            {saved && <span role="status" className="text-xs text-success">Saved</span>}
          </div>
        </form>

        <dl className="mt-5 grid gap-2 border-t border-border pt-4 text-xs sm:grid-cols-[140px_1fr]">
          <dt className="text-subtle">Effective URL</dt>
          <dd className="font-mono text-fg break-all">{effective}</dd>
          <dt className="text-subtle">Health</dt>
          <dd className="text-fg">
            {health.isPending ? 'Checking…' : health.isError ? 'Unreachable' : `${health.data.status} (v${health.data.version})`}
          </dd>
          <dt className="text-subtle">API</dt>
          <dd className="text-fg">
            {info.isSuccess
              ? `${info.data.name} ${info.data.api_version} · persistence ${info.data.persistence_enabled ? 'enabled' : 'disabled'}`
              : info.isPending
                ? 'Checking…'
                : 'Unavailable'}
          </dd>
        </dl>
      </CardBody>
    </Card>
  )
}

export function SettingsPage() {
  const id = useId()
  const { settings, updateSettings } = useSettings()
  const history = useAnalysisHistory()

  return (
    <>
      <PageHeader title="Settings" description="Preferences are stored in this browser only." />
      <div className="max-w-3xl space-y-6">
        <ConnectionCard />

        <Card>
          <CardHeader title="Preferences" />
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor={`${id}-network`}>Default network</FieldLabel>
                <Select
                  id={`${id}-network`}
                  value={settings.defaultNetwork}
                  onChange={(e) => updateSettings({ defaultNetwork: e.target.value as StellarNetwork })}
                >
                  {NETWORKS.map((n) => (
                    <option key={n} value={n}>
                      {networkLabel(n)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor={`${id}-theme`}>Theme</FieldLabel>
                <Select
                  id={`${id}-theme`}
                  value={settings.theme}
                  onChange={(e) => updateSettings({ theme: e.target.value as ThemePreference })}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </Select>
              </div>
            </div>
            <Toggle
              id={`${id}-history`}
              label="Save analysis history"
              description="Keep completed reports in this browser so they can be reopened later. Nothing is uploaded."
              checked={settings.saveHistory}
              onChange={(saveHistory) => updateSettings({ saveHistory })}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Data" />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {history.length} report{history.length === 1 ? '' : 's'} stored locally.
              </p>
              <Button
                variant="danger"
                size="sm"
                disabled={history.length === 0}
                onClick={() => {
                  if (window.confirm('Delete all locally stored reports?')) clearHistory()
                }}
              >
                Clear history
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-sm text-muted">Restore all settings to their defaults.</p>
              <Button variant="secondary" size="sm" onClick={() => updateSettings(defaultSettings())}>
                Reset settings
              </Button>
            </div>
          </CardBody>
        </Card>

        <Alert tone="info" title="No secrets in the frontend">
          The frontend has no API keys or credentials. Any authentication or rate limiting is handled by the backend.
        </Alert>
      </div>
    </>
  )
}
