const fs = require('fs')

export interface UpdateNoticeStateType {
    validateRemain: number
}

export interface UpdateNoticeConfigType {
    revalidateLimit: number
    forcedMirror: string
}

export const DEFAULT_VALIDATE_REMAINS = 20
export const DEFAULT_RC_STATE: UpdateNoticeStateType = {
    validateRemain: 0
}
export const DEFAULT_RC_CONFIG: UpdateNoticeConfigType = {
    revalidateLimit: DEFAULT_VALIDATE_REMAINS,
    forcedMirror: ''
}

/**
 * Judge if RcState is valid
 * @param rcFile
 */
export const isRcStateValid = (rcFile: any): rcFile is UpdateNoticeStateType => {
    if (!rcFile) return false
    if (!Number.isInteger(rcFile.validateRemain)) return false
    return true
}

/**
 * Judge if RcConfig is valid
 * @param rcFile
 */
export const isRcConfigValid = (rcConfig: any): rcConfig is UpdateNoticeConfigType => {
    if (!rcConfig) return false
    if (!Number.isInteger(rcConfig.revalidateLimit)) return false
    return true
}

const getRcState = (rcPath: string): UpdateNoticeStateType => {
    const rcExists = fs.existsSync(rcPath)
    if (rcExists) {
        try {
            const rcContent = JSON.parse(fs.readFileSync(rcPath, { encoding: 'utf8' }))
            if (isRcStateValid(rcContent)) return rcContent
            return DEFAULT_RC_STATE
        } catch (err) {
            return DEFAULT_RC_STATE
        }
    }
    return DEFAULT_RC_STATE
}

const getRcConfig = (rcConfig?: Partial<UpdateNoticeConfigType>): UpdateNoticeConfigType => {
    return {
        revalidateLimit: rcConfig?.revalidateLimit ?? DEFAULT_VALIDATE_REMAINS,
        forcedMirror: rcConfig?.forcedMirror ?? ''
    }
}

export const checkShouldUpdate = (rcPath: string, rcConfig?: Partial<UpdateNoticeConfigType>) => {
    const rcContent = getRcState(rcPath)
    const rcOptions = getRcConfig(rcConfig)

    if (rcContent.validateRemain === 0) {
        rcContent.validateRemain = rcOptions.revalidateLimit
        fs.writeFileSync(rcPath, JSON.stringify(rcContent, null, 2), { encoding: 'utf8' })
        return {
            validate: true,
            options: rcOptions
        }
    }
    rcContent.validateRemain -= 1
    fs.writeFileSync(rcPath, JSON.stringify(rcContent, null, 2), { encoding: 'utf8' })
    return {
        validate: false,
        options: rcOptions
    }
}
