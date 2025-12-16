const express = require('express');
const router = express.Router();

function configureTaskDisplayRoutes(dependencies) {
    const { verifyToken, taskDisplayController } = dependencies;

    router.get(
        '/statistics/display',
        verifyToken,
        (req, res, next) => taskDisplayController.getStatisticsForDisplay(req, res, next)
    );

    router.get(
        '/display',
        verifyToken,
        (req, res, next) => taskDisplayController.getTaskListForDisplay(req, res, next)
    );

    router.get(
        '/:id/display',
        verifyToken,
        (req, res, next) => taskDisplayController.getTaskForDisplay(req, res, next)
    );

    return router;
}

module.exports = configureTaskDisplayRoutes;
