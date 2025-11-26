/**
 * Application Configuration
 * 
 * Centralized configuration for application-wide settings.
 * Modify these values to customize application behavior.
 */

const appConfig = {
    // Session Management
    session: {
        // Session timeout in minutes (default: 30 minutes)
        timeoutMinutes: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES) || 30,

        // Interval to check session validity in seconds (default: 60 seconds)
        checkIntervalSeconds: 60
    },

    // Pagination Settings
    pagination: {
        // Default number of records per page (default: 10)
        defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10,

        // Available page size options for user selection
        pageSizeOptions: [10, 25, 50, 100],

        // Maximum allowed page size
        maxPageSize: 100
    },

    // API Settings
    api: {
        // API request timeout in milliseconds (default: 30 seconds)
        timeout: 30000,

        // Number of retry attempts for failed requests
        retryAttempts: 3
    },

    // UI Settings
    ui: {
        // Date format for display
        dateFormat: 'YYYY-MM-DD',

        // Time format for display
        timeFormat: 'HH:mm:ss',

        // DateTime format for display
        datetimeFormat: 'YYYY-MM-DD HH:mm'
    },

    // Language Settings
    language: {
        // Default language code (en, vi, ko)
        defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',

        // Available languages
        availableLanguages: ['en', 'vi', 'ko']
    },

    // Database Connection Pool (for reference, actual config in database.js)
    database: {
        // Connection pool acquire timeout in milliseconds
        acquireTimeout: 30000,

        // Maximum number of connections in pool
        maxConnections: 10
    }
};

export default appConfig;
