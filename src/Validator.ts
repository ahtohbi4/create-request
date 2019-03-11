export type GetValidateType = (values: { [key: string]: any }) => (undefined | { [key: string]: string });

export default class Validator {
    private static normalize(
        getValidate: (GetValidateType | GetValidateType[] | undefined),
    ): (GetValidateType[] | undefined) {
        if (Array.isArray(getValidate)) {
            return (getValidate.length === 0) ? undefined : getValidate;
        }

        if (getValidate === undefined) {
            return undefined;
        }

        return [getValidate];
    }

    constructor(getValidate: (GetValidateType | GetValidateType[] | undefined)) {
        this.getValidate = Validator.normalize(getValidate);
    }

    private readonly getValidate?: GetValidateType[];

    merge(nextValidator: ValidatorType) {
        const { getValidate } = nextValidator;

        return new Validator([
            ...(this.getValidate || []),
            ...(getValidate || []),
        ]);
    }

    apply(values: { [key: string]: any }) {
        if (this.getValidate === undefined) {
            return undefined;
        }

        return this.getValidate.reduce((result: any, getValidate: GetValidateType) => {
            const errors = getValidate(values);

            if (errors === undefined) {
                return result;
            }

            if (result === undefined) {
                return errors;
            }

            return {
                ...result,
                ...errors,
            };
        }, undefined);
    }
}

/**
 * Creates a new instance of Validator or return it if already is.
 *
 * @param {GetValidateType|ValidatorType} [validator]
 */
export const createValidator = (
    validator: (GetValidateType | ValidatorType | undefined),
): Validator => (validator instanceof Validator) ? validator : new Validator(validator);

export type ValidatorType = InstanceType<typeof Validator>;
