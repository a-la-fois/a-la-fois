import { useRef } from 'react';
import { Row } from '../Row';
import './CanvasEditor.css';

interface CanvasEditorProps {
    width: number;
    height: number;
    selectedColor: string;
}

export const CanvasEditor = ({ width, height, selectedColor }: CanvasEditorProps) => {
    const panelRef = useRef<HTMLDivElement>(null);

    let rows = [];

    for (let i = 0; i < height; i++) {
        rows.push(<Row key={i} width={width} selectedColor={selectedColor} />);
    }
    return (
        <div id="canvasEditor">
            <div id="pixels" ref={panelRef}>
                {rows}
            </div>
        </div>
    );
};
