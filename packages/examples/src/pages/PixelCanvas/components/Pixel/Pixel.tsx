import { useContext, useEffect, useState } from 'react';
import { CanvasContext, ChangeColorEventName } from '../../context';
import './pixel.css';

interface PixelProps {
    rowNumber: number;
    pixelNumber: number;
    selectedColor: string;
}

export const Pixel = ({ rowNumber, pixelNumber, selectedColor }: PixelProps) => {
    const [pixelColor, setPixelColor] = useState('#fff');
    const [oldColor, setOldColor] = useState(pixelColor);
    const [canChangeColor, setCanChangeColor] = useState(true);

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

    function applyColor() {
        setPixelColor(selectedColor);
        setCanChangeColor(false);

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
    }

    function changeColorOnHover() {
        setOldColor(pixelColor);
        setPixelColor(selectedColor);
    }

    function resetColor() {
        if (canChangeColor) {
            setPixelColor(oldColor);
        }

        setCanChangeColor(true);
    }

    return (
        <div
            className="pixel"
            onClick={applyColor}
            onMouseEnter={changeColorOnHover}
            onMouseLeave={resetColor}
            style={{ backgroundColor: pixelColor }}
        ></div>
    );
};
