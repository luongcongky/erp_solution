'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableMenuRow({ id, children, isDragging, isChild = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({
        id,
        data: {
            isChild
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: (isDragging || isSortableDragging) ? 0.5 : 1,
        cursor: 'default',
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`tableRow ${isDragging || isSortableDragging ? 'dragging' : ''} ${isChild ? 'child-row' : 'parent-row'}`}
        >
            {children({ listeners, attributes })}
        </tr>
    );
}
