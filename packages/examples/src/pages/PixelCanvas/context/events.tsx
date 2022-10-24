export const ChangeColorEventName = 'change_color';

export interface CanvasEvent {
    name: string;
    payload: any;
}

export interface ChangeColorEvent extends CanvasEvent {
    name: typeof ChangeColorEventName;
    payload: {
        position: [number, number];
        color: string;
    };
}
