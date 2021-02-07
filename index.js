const express = require('express');

const { OpenapiViewerRouter } = require('./dist/index');

let expressApp;
let openapiViewerMiddleware;

const config = {
    basePath: '/',
    filePath: './openapi.yml',
    rawPath: '/api/ui/meow',
    uiPath: '/api/ui'
};
openapiViewerMiddleware = new OpenapiViewerRouter(config);
openapiViewerMiddleware.setupA();
expressApp = express();
expressApp.use('/docs', openapiViewerMiddleware.getRouter());
// expressApp.get('/', function(req, res, next) {res.end('Hi');})
expressApp.listen(8080, function() { console.log('avi'); });
