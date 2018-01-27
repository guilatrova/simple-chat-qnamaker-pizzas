const restify = require('restify');

const server = restify.createServer();
const start = () => {
    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log('%s listening to %s', server.name, server.url);
    });

    return server;
};

module.exports = start;