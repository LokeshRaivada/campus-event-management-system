import React from 'react';

const Skeleton = ({ width, height, borderRadius, style, className }) => {
    return (
        <div
            className={`skeleton ${className || ''}`}
            style={{
                width,
                height,
                borderRadius,
                ...style
            }}
        />
    );
};

export default Skeleton;
