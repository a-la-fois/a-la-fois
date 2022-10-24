import { CanvasEditor } from './components/CanvasEditor';
import { CirclePicker } from 'react-color';
import { useState } from 'react';
import { EDITOR_CONFIG } from './config';
import { CanvasContextProvider } from './context';
import styles from './PixelCanvasPage.module.css';

export const PixelCanvasPage = () => {
    const [selectedColor, setColor] = useState('#f44336');

    const changeColor = (color: any) => {
        setColor(color.hex);
    };

    return (
        <div>
            <h1 className={styles['Header']}>Pixel canvas</h1>
            <div className={styles['ColorPicker']}>
                <CirclePicker color={selectedColor} onChangeComplete={changeColor} colors={EDITOR_CONFIG.colors} />
            </div>
            <CanvasContextProvider>
                <CanvasEditor selectedColor={selectedColor} width={EDITOR_CONFIG.size} height={EDITOR_CONFIG.size} />
            </CanvasContextProvider>
        </div>
    );
};
