import { useState } from 'react';
import './pixel.css';

interface PixelProps {
    selectedColor: string;
}

export const Pixel = ({ selectedColor }: PixelProps) => {
    const [pixelColor, setPixelColor] = useState('#fff');
    const [oldColor, setOldColor] = useState(pixelColor);
    const [canChangeColor, setCanChangeColor] = useState(true);

    function applyColor() {
        setPixelColor(selectedColor);
        setCanChangeColor(false);
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
