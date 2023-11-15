const { createRequestHandler } = require('web-adapter');
exports.handler = createRequestHandler({
    build: require("../build/index.js"),
});
