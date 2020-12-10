export const UPDATE_CLOG = 'Version update brought changes as below: '
export const UPDATE_HINT = 'Version __L_T_VER__ of __PKG_NAME__ is out, run the following command for upgrade \n\nnpm i __PKG_NAME__ -D \nyarn add __PKG_NAME__ --dev'
export const LANG = process.env.LANG?.startsWith('zh') ? 'zh' : 'en'