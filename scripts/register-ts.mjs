import { register } from 'node:module'

register('./ts-resolve-hook.mjs', new URL('./', import.meta.url).href)
