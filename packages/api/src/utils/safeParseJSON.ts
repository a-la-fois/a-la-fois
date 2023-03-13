export const safeParseJSON = <TType = any>(json: string, defaultValue?: TType): TType | null => {
    try {
        return JSON.parse(json);
    } catch (_error) {
        return defaultValue !== undefined ? defaultValue : null;
    }
};
