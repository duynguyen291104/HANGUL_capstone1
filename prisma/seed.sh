#!/bin/bash

# Script to seed initial data into the database

echo "🌱 Seeding database with sample vocabulary..."

# You can customize this script to load your initial data
# This is just a template

psql -U $POSTGRES_USER -d $POSTGRES_DB <<-EOSQL
    -- Insert sample vocabulary if needed
    -- INSERT INTO vocabulary (id, ko, vi, tags) VALUES
    -- ('sample-1', '안녕하세요', 'Xin chào', ARRAY['greeting']::TEXT[]);
    
    -- Initialize default user stats
    INSERT INTO user_stats (id, "totalWordsLearned", "currentStreak", "bestStreak")
    VALUES ('main', 0, 0, 0)
    ON CONFLICT (id) DO NOTHING;

    -- Initialize default user settings
    INSERT INTO user_settings (id, theme, "audioEnabled")
    VALUES ('main', 'light', true)
    ON CONFLICT (id) DO NOTHING;

    ECHO '✅ Database seeded successfully!';
EOSQL
