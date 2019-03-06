import mergeValidators, { ValidatorType } from './mergeValidators';

export default class UrlDeclaration {
    constructor(url: string | { pattern: string, validate?: any }) {
        if (typeof url === 'string') {
            this.pattern = url;
        } else {
            const { pattern, validate } = url;

            this.pattern = pattern;

            if (validate) {
                this.validate = validate;
            }
        }
    }

    readonly pattern: string;
    readonly validate?: ValidatorType;

    apply(nextUrl: UrlDeclarationType) {
        const { pattern, validate = [] } = nextUrl;

        return new UrlDeclaration({
            pattern: this.pattern + pattern,
            ...((this.validate || validate)
                ? { validate: mergeValidators(this.validate, validate) }
                : {}),
        });
    }

    interpolate(params: { [key: string]: (number | string) } = {}): string {
        let getParams = params;

        const interpolatedUrl = this.pattern.replace(
            /{([^}]+)}/g,
            (_match, param) => {
                const [name, defaultValue] = (param as string).split('=', 2);
                const { [name.trim()]: value = defaultValue, ...restGetParams } = getParams;
                getParams = restGetParams;

                if (value === undefined) {
                    return `{${param}}`;
                }

                return String(value).trim();
            },
        );

        return `${interpolatedUrl}${Object.entries(getParams)
            .reduce((result, [key, value], index) => {
                const separator = (index === 0) ? '?' : '&';

                return `${result}${separator}${key}=${value}`;
            }, '')}`;
    }

    toString() {
        return this.pattern;
    }
}

export type UrlDeclarationType = InstanceType<typeof UrlDeclaration>;
