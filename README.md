# VersionChecker
> ⚙ A simple util to quickly setup auto update checker for your application

VersionChecker is a simple util for periodically comparing your user's local installed version and your latest published (latest) version, notice user with your changelogs. Fully configurable!🍻


### Usage

Install
```shell
# Using Yarn
yarn add vercheck
# Using NPM
npm install vercheck
```


Usage

API
```typescript
const { checkUpdate } = require('vercheck')

async function main() {
  await checkUpdate(path.join(__dirname, 'package.json'))
  /** your other businessLogic */
}
```

CLI commands

You can run certain commands in cli via `yarn ${command}` or `npm run ${command}`, provide your changelog messages, the command will add your message to package changelog and then bump up current version.

- `vcpatch`
- `vcminor`
- `vcmajor`
- `vcpre`
- `vcpub`


### Configurations

```javascript
module.exports = {
  	
}
```