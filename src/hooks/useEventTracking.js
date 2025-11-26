import { useState } from 'react';

import { useAuth } from '@/components/AuthProvider';

/**
 * Hook to track user events and save them to audit logs.
 * @returns {Object} { trackEvent, loading, error }
 */
export const useEventTracking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    /**
     * Track an event.
     * @param {Object} params
     * @param {string} params.action - Action type (from ACTION_TYPES)
     * @param {string} params.module - Module name (e.g., 'USERS', 'INVENTORY')
     * @param {string} [params.object_type] - Type of object being acted upon
     * @param {string} [params.object_id] - ID of the object
     * @param {string} [params.details] - Human readable details of the action
     * @param {Object} [params.changes] - JSON object describing changes
     */
    const trackEvent = async ({ action, module, object_type, object_id, details, changes }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/audit-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    module,
                    object_type,
                    object_id,
                    details,
                    changes,
                    user_id: user?.id,
                    userName: user?.name, // Pass user name for the log
                    ten_id: user?.ten_id,
                    stg_id: user?.stg_id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Audit log API error:', errorData);
                throw new Error(errorData.details || errorData.error || 'Failed to save audit log');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Event tracking error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { trackEvent, loading, error };
};
