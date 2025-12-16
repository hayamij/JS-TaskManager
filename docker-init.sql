USE master;
GO

EXEC sp_configure 'contained database authentication', 1;
RECONFIGURE;
GO

-- Create TaskManager as contained database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TaskManager')
BEGIN
    CREATE DATABASE TaskManager CONTAINMENT = PARTIAL;
    PRINT 'Database TaskManager created successfully.';
END
ELSE
BEGIN
    PRINT 'Database TaskManager already exists.';
END
GO

-- Create SQL Server login with password policy disabled
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'fuongtuan')
BEGIN
    CREATE LOGIN fuongtuan WITH PASSWORD = 'toilabanhmochi', CHECK_POLICY = OFF;
    PRINT 'Login fuongtuan created successfully.';
END
GO

-- Create database user
USE TaskManager;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'fuongtuan')
BEGIN
    CREATE USER fuongtuan FOR LOGIN fuongtuan;
    ALTER ROLE db_owner ADD MEMBER fuongtuan;
    PRINT 'User fuongtuan created successfully with simple password.';
END
ELSE
BEGIN
    PRINT 'User fuongtuan already exists.';
END
GO

-- Drop existing tables if they exist
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Tasks')
    DROP TABLE dbo.Tasks;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
    DROP TABLE dbo.Users;
GO

-- ============================================
-- Create Users Table
-- ============================================
CREATE TABLE dbo.Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    username NVARCHAR(50) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_Users_Email UNIQUE (email),
    CONSTRAINT UQ_Users_Username UNIQUE (username)
);

CREATE INDEX IX_Users_Email ON dbo.Users(email);
CREATE INDEX IX_Users_Username ON dbo.Users(username);

PRINT 'Users table created successfully.';
GO

-- ============================================
-- Create Tasks Table
-- ============================================
CREATE TABLE dbo.Tasks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(1000) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    start_date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deadline DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Tasks_Users FOREIGN KEY (user_id) 
        REFERENCES dbo.Users(id) ON DELETE CASCADE,
    
    CONSTRAINT CK_Tasks_Status CHECK (status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

CREATE INDEX IX_Tasks_UserId ON dbo.Tasks(user_id);
CREATE INDEX IX_Tasks_Status ON dbo.Tasks(status);
CREATE INDEX IX_Tasks_UserId_Status ON dbo.Tasks(user_id, status);
CREATE INDEX IX_Tasks_StartDate ON dbo.Tasks(start_date);
CREATE INDEX IX_Tasks_Deadline ON dbo.Tasks(deadline);

PRINT 'Tasks table created successfully.';
GO

-- ============================================
-- Create Triggers
-- ============================================
CREATE TRIGGER TR_Users_UpdateTimestamp
ON dbo.Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Users
    SET updated_at = GETUTCDATE()
    FROM dbo.Users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TRIGGER TR_Tasks_UpdateTimestamp
ON dbo.Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Tasks
    SET updated_at = GETUTCDATE()
    FROM dbo.Tasks t
    INNER JOIN inserted i ON t.id = i.id;
END;
GO

-- ============================================
-- Create Stored Procedure
-- ============================================
CREATE PROCEDURE SP_GetUserStatistics
    @user_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        CAST(
            (SUM(CASE WHEN status = 'COMPLETED' THEN 1.0 ELSE 0 END) / 
            NULLIF(COUNT(*), 0)) * 100 
            AS DECIMAL(5,2)
        ) as completion_rate
    FROM dbo.Tasks
    WHERE user_id = @user_id;
END;
GO

-- ============================================
-- Insert Sample Data
-- ============================================
DECLARE @user1_id UNIQUEIDENTIFIER = NEWID();
DECLARE @user2_id UNIQUEIDENTIFIER = NEWID();
DECLARE @user3_id UNIQUEIDENTIFIER = NEWID();
DECLARE @user4_id UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Users (id, username, email, password, created_at, updated_at)
VALUES 
    (@user1_id, 'johndoe', 'john.doe@example.com', '$2b$10$rXQ3Qqz8b9K5gJZJ5aB5ZeG5YH5J5aB5ZeG5YH5J5aB5ZeG5YH5J5a', GETUTCDATE(), GETUTCDATE()),
    (@user2_id, 'janedoe', 'jane.doe@example.com', '$2b$10$rXQ3Qqz8b9K5gJZJ5aB5ZeG5YH5J5aB5ZeG5YH5J5aB5ZeG5YH5J5a', GETUTCDATE(), GETUTCDATE()),
    (@user3_id, 'testuser', 'test@example.com', '$2b$10$rXQ3Qqz8b9K5gJZJ5aB5ZeG5YH5J5aB5ZeG5YH5J5aB5ZeG5YH5J5a', GETUTCDATE(), GETUTCDATE()),
    (@user4_id, 'hayami', 'nqtuanp2005@gmail.com', '$2b$10$WijFod5JggJQQj5id519hOp95mKchdr.VSF8Lr/krypZXicHtoJTa', GETUTCDATE(), GETUTCDATE());

PRINT 'Sample users inserted: johndoe, janedoe, testuser, hayami';
GO

-- Get user IDs for tasks
DECLARE @user1_id UNIQUEIDENTIFIER = (SELECT id FROM dbo.Users WHERE username = 'johndoe');
DECLARE @user2_id UNIQUEIDENTIFIER = (SELECT id FROM dbo.Users WHERE username = 'janedoe');
DECLARE @user3_id UNIQUEIDENTIFIER = (SELECT id FROM dbo.Users WHERE username = 'testuser');

-- Sample Tasks for User 1 (johndoe)
INSERT INTO dbo.Tasks (id, user_id, title, description, status, start_date, deadline, created_at, updated_at)
VALUES 
    (NEWID(), @user1_id, 'Setup development environment', 'Install Node.js, SQL Server, and VS Code', 'COMPLETED', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -8, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -8, GETUTCDATE())),
    (NEWID(), @user1_id, 'Review Clean Architecture principles', 'Read documentation and understand layer separation', 'COMPLETED', DATEADD(day, -7, GETUTCDATE()), DATEADD(day, -5, GETUTCDATE()), DATEADD(day, -7, GETUTCDATE()), DATEADD(day, -5, GETUTCDATE())),
    (NEWID(), @user1_id, 'Implement authentication module', 'Create register, login, and token verification use cases', 'IN_PROGRESS', DATEADD(day, -3, GETUTCDATE()), DATEADD(day, 2, GETUTCDATE()), DATEADD(day, -3, GETUTCDATE()), GETUTCDATE()),
    (NEWID(), @user1_id, 'Write unit tests', 'Add tests for domain entities and use cases', 'PENDING', GETUTCDATE(), DATEADD(day, 5, GETUTCDATE()), GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @user1_id, 'Deploy to production', 'Setup Azure App Service and SQL Database', 'SCHEDULED', DATEADD(day, 3, GETUTCDATE()), DATEADD(day, 10, GETUTCDATE()), GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @user1_id, 'Fix critical bug', 'Urgent bug fix required', 'FAILED', DATEADD(day, -5, GETUTCDATE()), DATEADD(day, -2, GETUTCDATE()), DATEADD(day, -5, GETUTCDATE()), GETUTCDATE()),
    (NEWID(), @user1_id, 'Old feature request', 'This was cancelled due to priority change', 'CANCELLED', DATEADD(day, -8, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()), DATEADD(day, -8, GETUTCDATE()), GETUTCDATE());

-- Sample Tasks for User 2 (janedoe)
INSERT INTO dbo.Tasks (id, user_id, title, description, status, start_date, deadline, created_at, updated_at)
VALUES 
    (NEWID(), @user2_id, 'Design database schema', 'Create ERD and define all tables', 'COMPLETED', DATEADD(day, -15, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -15, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE())),
    (NEWID(), @user2_id, 'Implement task CRUD operations', 'Add create, read, update, delete functionality', 'COMPLETED', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -7, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -7, GETUTCDATE())),
    (NEWID(), @user2_id, 'Build frontend dashboard', 'Create HTML, CSS, and JavaScript for UI', 'IN_PROGRESS', DATEADD(day, -5, GETUTCDATE()), DATEADD(day, 3, GETUTCDATE()), DATEADD(day, -5, GETUTCDATE()), GETUTCDATE()),
    (NEWID(), @user2_id, 'Add task statistics feature', 'Show completion rate and task counts', 'PENDING', GETUTCDATE(), DATEADD(day, 7, GETUTCDATE()), GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @user2_id, 'Performance optimization', 'Optimize database queries', 'SCHEDULED', DATEADD(day, 5, GETUTCDATE()), DATEADD(day, 15, GETUTCDATE()), GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @user2_id, 'Deprecated feature', 'This feature was removed from requirements', 'CANCELLED', DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -5, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE()), GETUTCDATE());

-- Sample Tasks for User 3 (testuser)
INSERT INTO dbo.Tasks (id, user_id, title, description, status, start_date, deadline, created_at, updated_at)
VALUES 
    (NEWID(), @user3_id, 'Learn SQL Server', 'Complete online tutorial on T-SQL basics', 'COMPLETED', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -15, GETUTCDATE()), DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -15, GETUTCDATE())),
    (NEWID(), @user3_id, 'Practice Clean Architecture', 'Build sample project following CA principles', 'IN_PROGRESS', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, 5, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE()), GETUTCDATE()),
    (NEWID(), @user3_id, 'Buy groceries', 'Milk, eggs, bread, and vegetables', 'PENDING', GETUTCDATE(), NULL, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @user3_id, 'Exercise routine', 'Monday: Chest, Tuesday: Back, Wednesday: Legs', 'PENDING', GETUTCDATE(), NULL, GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @user3_id, 'Read architecture book', 'Finish Clean Architecture by Robert C. Martin', 'SCHEDULED', DATEADD(day, 7, GETUTCDATE()), DATEADD(day, 30, GETUTCDATE()), GETUTCDATE(), GETUTCDATE()),
    (NEWID(), @user3_id, 'Complete online course', 'Deadline was yesterday', 'FAILED', DATEADD(day, -14, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE()), GETUTCDATE()),
    (NEWID(), @user3_id, 'Attend conference', 'Conference was cancelled', 'CANCELLED', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 10, GETUTCDATE()), DATEADD(day, -30, GETUTCDATE()), GETUTCDATE());

PRINT 'Sample tasks inserted successfully.';
GO

-- ============================================
-- Verification
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'DOCKER DATABASE SETUP COMPLETED';
PRINT '============================================';
PRINT '';
PRINT 'Database: TaskManager';
PRINT 'User: fuongtuan';
PRINT 'Password: toilabanhmochi';
PRINT '';
PRINT 'Test credentials (all passwords: password123):';
PRINT '- john.doe@example.com / password123';
PRINT '- jane.doe@example.com / password123';
PRINT '- test@example.com / password123';
PRINT '- nqtuanp2005@gmail.com / password123';
PRINT '';
PRINT 'Tables: Users, Tasks';
PRINT 'Sample data loaded successfully!';
GO
