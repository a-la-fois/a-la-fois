import { useRef } from 'react';
import { Row } from '../Row';
import styles from './CanvasEditor.module.css';

interface CanvasEditorProps {
    width: number;
    height: number;
    selectedColor: string;
}

export const CanvasEditor = ({ width, height, selectedColor }: CanvasEditorProps) => {
    const panelRef = useRef<HTMLDivElement>(null);

    let rows = [];

    for (let i = 0; i < height; i++) {
        rows.push(<Row key={i} rowNumber={i} width={width} selectedColor={selectedColor} />);
    }
    return (
        <div className={styles['CanvasEditor']}>
            <div className={styles['CanvasEditor-Pixels']} ref={panelRef}>
                {rows}
            </div>
        </div>
    );
};
