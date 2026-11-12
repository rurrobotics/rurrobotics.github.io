import { loadLocales } from 'wuchale/load-utils/server'
import { locales } from './data.js'
import { loadCatalog, loadCount } from './.wuchale/endpoints.proxy.sync.js'

export { loadCatalog, loadCount }
export const key = 'endpoints'

// two exports
export const getRuntime = await loadLocales(key, loadCount, loadCatalog, locales)
export const getRuntimeRx = getRuntime
