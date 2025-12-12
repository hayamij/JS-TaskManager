const { App } = require('./app');

/**
 * Server Entry Point
 */
async function main() {
    const app = new App();

    try {
        // Initialize application
        await app.initialize();

        // Start server
        await app.start();

        // Graceful shutdown
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

// Start the server
main();
