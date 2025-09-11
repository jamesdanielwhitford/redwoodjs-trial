-- Add Task table for Live Task Board functionality
CREATE TABLE Task (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    position INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX Task_userId_idx ON Task(userId);
CREATE INDEX Task_status_idx ON Task(status);
CREATE INDEX Task_position_idx ON Task(position);

-- Create trigger to automatically update updatedAt timestamp
CREATE TRIGGER Task_updatedAt_trigger
    AFTER UPDATE ON Task
    FOR EACH ROW
    BEGIN
        UPDATE Task SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;