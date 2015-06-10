module.exports = function (requirejs) {
    console.log(__dirname);
    requirejs.config({
        baseUrl: __dirname,
        nodeRequire: require,
        paths: {
            logger: 'logger',
            config: '../config',
            controller: 'controller',
            database: 'dbmysql',
            openhab: 'openhab',
            routes: '../routes/api',
            ethernetwrapper: 'ethernetwrapper',
            serialwrapper: 'serialwrapper'
        }
    });
};