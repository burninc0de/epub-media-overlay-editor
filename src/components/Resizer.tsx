import React from 'react';

interface ResizerProps {
    onMouseDown: (e: React.MouseEvent) => void;
    direction?: 'horizontal' | 'vertical';
}

export const Resizer: React.FC<ResizerProps> = ({ onMouseDown, direction = 'horizontal' }) => {
    const baseClasses = "bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200";
    const directionClasses = direction === 'horizontal'
        ? "w-2 h-full cursor-col-resize"
        : "h-2 w-full cursor-ns-resize";
    
    return (
        <div
            onMouseDown={onMouseDown}
            className={`${baseClasses} ${directionClasses} flex-shrink-0 flex items-center justify-center`}
        >
             <div className={direction === 'horizontal' ? "w-1 h-8 bg-gray-500 dark:bg-gray-600 rounded-full" : "w-8 h-1 bg-gray-500 dark:bg-gray-600 rounded-full"}></div>
        </div>
    );
};
