const path = require('path')
const os = require('os')
import { fetchData } from "./http"
import { prerelease, gt, lte } from 'semver'
import { checkShouldUpdate, UpdateNoticeConfigType } from './config'
import { LANG, UPDATE_CLOG, UPDATE_HINT } from './constant'
import { getProperNpmListPath } from './mirror'

export interface UpdateCheckerConfig extends UpdateNoticeConfigType {
    message: string
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

export const checkUpdate = async (packagePath: string, config?: Partial<UpdateCheckerConfig>) => {
    const pkg = require(packagePath)
    const rcPath = path.join(os.homedir(), `.${pkg.name}vcrc`)
    const { options, validate } = checkShouldUpdate(rcPath, config)
    if (!validate) return false
    try {
        const localVersion = pkg.version
        /** FetchData */
        const npmData = await fetchData(getProperNpmListPath(pkg.name, options?.forcedMirror))
        const latestVersion = npmData['dist-tags']?.latest
        if (!latestVersion || latestVersion === localVersion) return false
        /** Do nothing if user uses prerelease versions */
        if (prerelease(localVersion)) return false
        /** Only build notice when latestVersion is greater than localVersion */
        if (gt(latestVersion, localVersion)) {
            const displayMessage = getLocalMessage(pkg.name ,latestVersion, config?.message)
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

