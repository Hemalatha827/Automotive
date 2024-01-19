const http = require('http');
const express = require('express');
const app = express();
app.use(express.json());

const searchRoutes = require('./routes/searchRouter');
const googleRoutes = require('./routes/googleAPi');
const parseRoutes = require('./routes/parserRouter');

//-------------------------------------------------------------------
/**
 * Initial starting  path to router
 */

app.use('/search', searchRoutes)
app.use('/google', googleRoutes)
app.use('/parse', parseRoutes)

//-------------------------------------------------------------------

const server = http.createServer(app);
const port = 8081;
server.listen(port);
console.debug('Server listening on port ' + port);