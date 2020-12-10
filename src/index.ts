import { fetchData } from "./http"
import { prerelease, gt, lte } from 'semver'
import { checkShouldUpdate } from './config'
import { LANG, UPDATE_CLOG, UPDATE_HINT } from './constant'
const Chalk = require('chalk')
const Shell = require('shelljs')
const fs = require('fs')
const defaultNpmMirror = 'http://registry.npmjs.org/'
const defaultYarnMirror = 'https://registry.yarnpkg.com/'
const sankuaiMirror = 'http://r.npm.sankuai.com/'
let npmMirror = sankuaiMirror
const getNpmMirror = () => {
    try {
        const mirrorResult = Shell.exec('npm config get registry', { silent: true })
        npmMirror = mirrorResult.stdout.trim()
    } catch (err) {
        npmMirror = sankuaiMirror
    }
}

const getProperNpmListPath = (packageName: string): string => {
    const hasNpmMirror =
        npmMirror !== defaultNpmMirror &&
        npmMirror !== defaultYarnMirror
    if (hasNpmMirror) {
        return `${npmMirror}${packageName}`
    }
    return `${sankuaiMirror}${packageName}`
}

const getLocalMessage = (packageName: string, latestVersion: string, originMessage?: string): string => {
    return (
        originMessage ||
        UPDATE_HINT
    ).replace('__L_T_VER__', latestVersion).replace(/__PKG_NAME__/g, packageName)
}

const getUpdateLogs = (npmData: any, currentVersion: string, latestVersion: string) => {
    if (prerelease(currentVersion) || !gt(latestVersion, currentVersion)) {
        return ''
    }
    /** parse version lists */
    const upcomingVersions = (Object.keys(npmData.versions || {}) as string[])
        .filter(incomingVersion =>
            Boolean(
                /** not prerelease */
                !prerelease(incomingVersion) &&
                /** larger than currentVersion */
                gt(incomingVersion, currentVersion) &&
                /** less or equal to latestVersion */
                lte(incomingVersion, latestVersion)
            )
        )
        .sort((versionA, versionB) => lte(versionA, versionB) ? -1 : 1)
    /** output version changelogs */
    return upcomingVersions.map(version => {
        const changelog = LANG === 'zh'
            ? npmData.versions?.[version]?.config.cnchangelog ?? npmData.versions?.[version]?.config.changelog ?? ''
            : npmData.versions?.[version]?.config.changelog ?? ''
        if (changelog) {
            return `[${version}]: ${changelog}`
        }
        return ''
    }).filter(Boolean).join('\n')
}

export const updateNotice = async (packagePath: string, rcPath: string, message?: string) => {
    if (!checkShouldUpdate(rcPath)) return false
    try {
        const pkg = require(packagePath)
        const localVersion = pkg.version
        getNpmMirror()
        /** FetchData */
        const npmData = await fetchData(getProperNpmListPath(pkg.name))
        const latestVersion = npmData['dist-tags']?.latest
        if (!latestVersion || latestVersion === localVersion) return false
        /** Do nothing if user uses prerelease versions */
        if (prerelease(localVersion)) return false
        /** Only build notice when latestVersion is greater than localVersion */
        if (gt(latestVersion, localVersion)) {
            const displayMessage = getLocalMessage(pkg.name ,latestVersion, message)
            const changelogs = getUpdateLogs(npmData, localVersion, latestVersion)
            console.log(displayMessage)
            if (changelogs) {
                console.log()
                console.log(UPDATE_CLOG)
                console.log(changelogs)
            }
            console.log()
            return {
                message: displayMessage,
                name: pkg.name,
                local: localVersion,
                latest: latestVersion
            }
        }
    } catch (err) {
        console.log(err.message)
        return false
    }
}

