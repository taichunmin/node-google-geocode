## Google Geocoding API

每 1000 次呼叫 5 美金，每月有 200 美金的免費額度。

* repo: `node-google-geocode`

```js
const fs = require('fs').promises
addrs = require('./input.json')
await fs.writeFile('./output.csv', (await index.addrsToLatlng(addrs)).join('\n'))
```