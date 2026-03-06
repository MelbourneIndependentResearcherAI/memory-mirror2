import { createClient } from '@base44/sdk'

const getParam = (key, envValue) => {
  if (typeof window === 'undefined') return envValue
  const urlParams = new URLSearchParams(window.location.search)
  const fromUrl = urlParams.get(key)
  if (fromUrl) {
    localStorage.setItem(`base44_${key}`, fromUrl)
    return fromUrl
  }
  const stored = localStorage.getItem(`base44_${key}`)
  return stored || envValue || null
}

export const base44 = createClient({
  appId: getParam('app_id', import.meta.env.VITE_BASE44_APP_ID),
  token: getParam('access_token', null),
  appBaseUrl: getParam('app_base_url', import.meta.env.VITE_BASE44_APP_BASE_URL),
  requiresAuth: false,
})
