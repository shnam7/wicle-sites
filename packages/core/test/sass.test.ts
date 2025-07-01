import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import fs from 'node:fs'
import sassTrue from 'sass-true'
import {describe, it} from 'vitest'
import '../wicle/base/_reset.scss'
import '../wicle/layout/_site.scss'
import './scss/base/reset.test.scss'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getFiles = (dir: string, recurrsive = true): string[] => {
    let files: string[] = []

    const fileList = fs.readdirSync(dir)
    for (const file of fileList) {
        const name = `${dir}/${file}`
        if (fs.statSync(name).isDirectory()) {
            if (recurrsive) files = [...files, ...getFiles(name, recurrsive)]
        } else {
            files.push(name)
        }
    }

    return files
}

const basePath = path.relative(process.cwd(), __dirname)
const sassTestFiles = getFiles(path.join(basePath, 'scss')).filter(
    s => s.endsWith('.test.scss') || s.endsWith('.test.sass'),
)

for (const sassFile of sassTestFiles) {
    sassTrue.runSass({describe, it}, sassFile, {
        loadPaths: ['node_modules/sass-wdk', '.'],
    })
}
