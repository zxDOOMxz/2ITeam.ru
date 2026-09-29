import { copyFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')

if (!existsSync(dist)) {
  console.error('postbuild: папка dist не найдена, сначала выполните vite build')
  process.exit(1)
}

const index = resolve(dist, 'index.html')

if (existsSync(index)) {
  copyFileSync(index, resolve(dist, '404.html'))
}

writeFileSync(resolve(dist, '.nojekyll'), '')

console.log('postbuild: созданы 404.html и .nojekyll')
