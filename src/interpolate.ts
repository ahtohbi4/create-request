type Interpolator = (
    pattern: string,
    params?: { [key: string]: number | string },
) => string;

/**
 * Returns a new string with parameters passed as the second argument or default values.
 *
 * @param {string} pattern
 * @param {object} [params={}]
 * @returns {string}
 *
 * @example
 *
 * interpolate('A {foo} is 42 and {baz=BAZ} is BAZ', { foo: 42 });
 *
 * // => "A 42 is 42 and BAZ is BAZ"
 */
const interpolate: Interpolator = (
    pattern,
    params = {},
) => pattern.replace(
    /{([^}]+)}/g,
    (_match, param) => {
        const [name, defaultValue] = <string>param.split('=', 2);
        const { [name.trim()]: value = defaultValue } = params;

        if (value === undefined) {
            return `{${param}}`;
        }

        return String(value).trim();
    },
);

export default interpolate;
