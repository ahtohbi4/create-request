export default class UrlDeclaration {
    static mergeValidators(...validators: any[]) {
        const resultValidator = validators.reduce((result, validator) => {
            if (validator === undefined) {
                return result;
            }

            if (Array.isArray(validator)) {
                return [
                    ...result,
                    ...validator,
                ];
            }

            return [
                ...result,
                validator,
            ];
        }, []);

        if (resultValidator.length < 2) {
            return resultValidator[0];
        }

        return resultValidator;
    }

    public pattern: string;
    public validate?: any;

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

    apply(nextUrl: any) {
        const { pattern, validate = [] } = nextUrl;

        return new UrlDeclaration({
            pattern: this.pattern + pattern,
            ...((this.validate || validate)
                ? { validate: UrlDeclaration.mergeValidators(this.validate, validate) }
                : {}),
        });
    }

    toString() {
        return this.pattern;
    }
}
