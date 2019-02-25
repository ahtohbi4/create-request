/**
 * Returns a new string with parameters passed as the second argument or default values.
 *
 * @param {string} pattern
 * @param {object} [params={}]
 */
export default (
    pattern: string,
    params: { [key: string]: number | string } = {},
): string => pattern.replace(/{([^}]+)}/g, (_match, param: string) => {
    const [name, defaultValue] = param.split('=', 2);
    const { [name.trim()]: value = defaultValue } = params;

    if (value === undefined) {
        return `{${param}}`;
    }

    return String(value).trim();
});
