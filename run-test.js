const createTestCafe = require('testcafe');
const { connect } = require('hadouken-js-adapter');
let runner = null;
let testcafe = null;

(async () => {
    //create Test Cafe Runner
    testcafe = await createTestCafe('localhost', 1337, 1338);
    runner = testcafe.createRunner();

    const remoteConnection = await testcafe.createBrowserConnection();

    console.log(`Launching test URL: ${remoteConnection.url}`);

    // Connect to a runtime
    const fin = await connect({
        uuid: 'openfin-runtime-connection',
        runtime: {
            version: 'stable'
        },
        nonPersistent: true
    });

    fin.once('disconnected', process.exit);

    // Create and run OpenFin application using test URL
    const testApp = await fin.Application.create({
        uuid: 'test',
        name: 'testing',
        url: remoteConnection.url,
        autoShow: true
    });

    testApp.run();

    remoteConnection.once('ready', async () => {
        await runner.src('tests.js');
        await runner.browsers(remoteConnection);
        await runner.run();
        testcafe.close();
        testApp.terminate();
    });
})();