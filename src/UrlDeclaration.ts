import { createValidator, GetValidateType, ValidatorType } from './Validator';

export default class UrlDeclaration {
    constructor(url: string | { pattern: string, validate?: (GetValidateType | ValidatorType) }) {
        if (typeof url === 'string') {
            this.pattern = url;
            this.validate = createValidator(undefined);
        } else {
            const { pattern, validate } = url;

            this.pattern = pattern;
            this.validate = createValidator(validate);
        }
    }

    readonly pattern: string;
    readonly validate: ValidatorType;

    apply(nextUrlDeclaration: UrlDeclarationType) {
        const { pattern, validate } = nextUrlDeclaration;

        return new UrlDeclaration({
            pattern: this.pattern + pattern,
            validate: this.validate.merge(validate),
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
