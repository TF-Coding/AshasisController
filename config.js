module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mysensors'
    },
    openhab: {
        useExperimentalV2Mapping: true,
        pushValuesOnly: true,
        useCollectorItem: false,
        collectorItemName: 'ArduinoRestInput',
        url: 'http://localhost:8080',
        auth: {
            user: 'test',
            password: 'test1'
        }
    },
    gateway: {
        useType: 'serial',
        serial: {
            port: '/dev/ttyAshasis',
            baudrate: 115200
        },
        ethernet: {
            port: '9999',
            address: '127.0.0.1',
            encoding: 'ascii'
        }
    },
    debug: {
        logGwRx: true,
        logGwTx: true,
        logOpenhabPush404: true
    },
    webif: { 
        root: '/ashasis' 	
    },
    controllerVersion: "0.9.0"

};