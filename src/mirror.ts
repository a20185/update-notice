const { execSync } = require('child_process');
const defaultNpmMirror = 'http://registry.npmjs.org/'
const defaultYarnMirror = 'https://registry.yarnpkg.com/'
let npmMirror = defaultNpmMirror

const getNpmMirror = (defaultMirror: string) => {
    try {
        const mirrorResult = execSync('npm config get registry', { encoding: 'utf8' })
        npmMirror = mirrorResult.trim()
    } catch (err) {
        npmMirror = defaultMirror
    }
}

export const getProperNpmListPath = (packageName: string, forcedMirror?: string): string => {
    /** force using selected mirror */
    if (forcedMirror) {
        return `${forcedMirror}${packageName}`
    }
    getNpmMirror(defaultNpmMirror)
    /** trying to parse mirror from user defined scripts */
    const hasNpmMirror =
        npmMirror !== defaultNpmMirror &&
        npmMirror !== defaultYarnMirror
    if (hasNpmMirror) {
        return `${npmMirror}${packageName}`
    }
    return `${defaultNpmMirror}${packageName}`
}