// Domain Layer Exports
// Pure business entities - NO framework dependencies

module.exports = {
    // Entities
    User: require('./entities/User').User,
    Task: require('./entities/Task').Task,
    
    // Value Objects
    TaskStatus: require('./valueobjects/TaskStatus').TaskStatus,
    
    // Exceptions
    DomainException: require('./exceptions/DomainException').DomainException
};
