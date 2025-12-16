const { App } = require('./app');

async function main() {
    const app = new App();

    try {
        await app.initialize();

        await app.start();

        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully...');
            await app.stop();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('\nSIGINT received, shutting down gracefully...');
            await app.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();
