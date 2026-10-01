export const storyError = (code, details = {}) => Object.assign(new Error(code), { code, details });
