import mergeValidators, { ValidatorType } from './mergeValidators';

export interface OptionsParamsType {
    config?: { [key: string]: any };

    validateConfig?: ValidatorType | ValidatorType[];
    validateResponse?: ValidatorType | ValidatorType[];
}

export default class Options {
    private static normalizeValidator(validator: ValidatorType | ValidatorType[] | undefined) {
        if (validator === undefined || Array.isArray(validator)) {
            return validator;
        }

        return [validator];
    }

    constructor({ config = {}, validateConfig, validateResponse }: OptionsParamsType = {}) {
        this.config = config;

        this.validateConfig = Options.normalizeValidator(validateConfig);
        this.validateResponse = Options.normalizeValidator(validateResponse);
    }

    readonly config: { [key: string]: any };
    readonly validateConfig?: ValidatorType[];
    readonly validateResponse?: ValidatorType[];

    apply(nextOptions: OptionsType): OptionsType {
        const { config = {}, validateConfig, validateResponse } = nextOptions;

        return new Options({
            config: {
                ...this.config,
                ...config,
            },
            validateConfig: mergeValidators(this.validateConfig, validateConfig),
            validateResponse: mergeValidators(this.validateResponse, validateResponse),
        });
    }
}

export type OptionsType = InstanceType<typeof Options>;
