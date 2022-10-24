import { useContext, useEffect, useState } from 'react';
import { CanvasContext, ChangeColorEventName } from '../../context';
import styles from './Pixel.module.css';

interface PixelProps {
    rowNumber: number;
    pixelNumber: number;
    selectedColor: string;
}

export const Pixel = ({ rowNumber, pixelNumber, selectedColor }: PixelProps) => {
    const [pixelColor, setPixelColor] = useState('#fff');
    const [oldColor, setOldColor] = useState(pixelColor);
    const contextValue = useContext(CanvasContext);

    useEffect(() => {
        if (contextValue && contextValue[1]) {
            const [connected, canvasState, handle] = contextValue;
            const key = rowNumber + '_' + pixelNumber;
            const color = canvasState.get(key);
            if (color) {
                setPixelColor(color);
                setOldColor(color);
            }
        }
    }, [contextValue]);

    const applyColor = () => {
        if (contextValue) {
            const [connected, canvasState, handle] = contextValue;
            handle({
                name: ChangeColorEventName,
                payload: {
                    position: [rowNumber, pixelNumber],
                    color: selectedColor,
                },
            });
        }
    };

    const changeColorOnHover = () => {
        setOldColor(pixelColor);
        setPixelColor(selectedColor);
    };

    const resetColor = () => {
        setPixelColor(oldColor);
    };

    return (
        <div
            className={styles['Pixel']}
            onClick={applyColor}
            onMouseEnter={changeColorOnHover}
            onMouseLeave={resetColor}
            style={{ backgroundColor: pixelColor }}
        />
    );
};
