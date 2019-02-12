# OpenFin <> TestCafe

Shows how to run tests using TestCafe on OpenFin.

## How to install
- Clone this repo
- Install npm-modules: `npm install`
- Run the tests: `npm start`

## How it works
We make use of the [remote browser](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#remote-browsers) option in TestCafe to create a URL that would then be launched in OpenFin.

### Create a test runner

First we initialize the test runner:

```
    testcafe = await createTestCafe('localhost', 1337, 1338);
    runner = testcafe.createRunner();
    const remoteConnection = await testcafe.createBrowserConnection();
```
This returns a remote connection object that contains the URL we will use to launch OpenFin.

### Create OpenFin app

Using the Node.js Adapter we can connect to a runtime and launch an OpenFin app using the URL returned by the remote connection.

```
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
        uuid: 'testcafe',
        name: 'testcafe',
        url: remoteConnection.url,
        autoShow: true,
        defaultHeight: 800,
        defaultWidth: 1200,
        saveWindowState: false
    });

    testApp.run();
```

### Running the tests
Once the connection is ready, we let the test runner know that we want to run the tests.

```
    remoteConnection.once('ready', async () => {
        await runner.src('tests.js');
        await runner.browsers(remoteConnection);
        await runner.run();
        testcafe.close();
        testApp.terminate();
    });
```