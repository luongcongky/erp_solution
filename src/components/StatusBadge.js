'use client';

export default function StatusBadge({ status, type = 'default' }) {
    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || '';

        // Sales/Order statuses
        if (statusLower.includes('draft')) return 'gray';
        if (statusLower.includes('confirmed') || statusLower.includes('approved')) return 'success';
        if (statusLower.includes('cancelled') || statusLower.includes('rejected')) return 'error';
        if (statusLower.includes('pending')) return 'warning';
        if (statusLower.includes('done') || statusLower.includes('completed')) return 'success';
        if (statusLower.includes('in_progress') || statusLower.includes('processing')) return 'primary';

        // Lead/Opportunity statuses
        if (statusLower.includes('new')) return 'primary';
        if (statusLower.includes('qualified')) return 'success';
        if (statusLower.includes('lost')) return 'error';

        // Ticket statuses
        if (statusLower.includes('open')) return 'warning';
        if (statusLower.includes('closed')) return 'gray';

        return 'gray';
    };

    const color = getStatusColor(status);

    return (
        <span className={`badge badge-${color}`}>
            {status}
        </span>
    );
}
