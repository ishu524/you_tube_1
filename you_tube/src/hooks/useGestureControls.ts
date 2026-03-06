import React, { useState, useRef, useCallback } from 'react';

export type GestureZone = 'left' | 'center' | 'right';

interface GestureOptions {
    onSingleTapCenter?: () => void;
    onDoubleTapLeft?: () => void;
    onDoubleTapRight?: () => void;
    onTripleTapCenter?: () => void;
    onTripleTapLeft?: () => void;
    onTripleTapRight?: () => void;
}

export const useGestureControls = (options: GestureOptions) => {
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleGesture = useCallback((clientX: number, containerWidth: number) => {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastTapTime;

        // Define zones
        const leftBoundary = containerWidth * 0.3;
        const rightBoundary = containerWidth * 0.7;

        let zone: GestureZone = 'center';
        if (clientX < leftBoundary) zone = 'left';
        else if (clientX > rightBoundary) zone = 'right';

        // Clear existing timeout
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
        }

        // Detect tap sequence
        let newCount = 1;
        if (timeDiff < 400) {
            newCount = tapCount + 1;
        }

        setTapCount(newCount);
        setLastTapTime(currentTime);

        // Process action based on count and zone
        tapTimeoutRef.current = setTimeout(() => {
            if (newCount === 1 && zone === 'center') {
                options.onSingleTapCenter?.();
            } else if (newCount === 2) {
                if (zone === 'left') options.onDoubleTapLeft?.();
                if (zone === 'right') options.onDoubleTapRight?.();
            } else if (newCount === 3) {
                if (zone === 'center') options.onTripleTapCenter?.();
                if (zone === 'left') options.onTripleTapLeft?.();
                if (zone === 'right') options.onTripleTapRight?.();
            }
            setTapCount(0);
        }, 400);
    }, [tapCount, lastTapTime, options]);

    return { handleGesture };
};
