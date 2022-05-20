export const packMessage = (type: number, data: Uint8Array) => {
    const message = new Uint8Array(data.length + 1);
    message.set(new Uint8Array([type]), 0);
    message.set(data, 1);

    return message;
};

export const unpackMessage = (message: ArrayBuffer) => {
    const dataViewer = new DataView(message);

    const type = dataViewer.getUint8(0);
    const data = new Uint8Array(message, 1);

    return {
        type,
        data,
    };
};
