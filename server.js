const express = require('express')
const app = express()

app.listen(process.env.PORT, () => console.log('SpotifyAppLink [SERVER]'))

module.exports = app