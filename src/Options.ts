import { createValidator, GetValidateType, ValidatorType } from './Validator';

export interface OptionsParamsType {
    config?: { [key: string]: any };

    validateConfig?: (GetValidateType | ValidatorType);
    validateResponse?: (GetValidateType | ValidatorType);
}

export default class Options {
    constructor({ config = {}, validateConfig, validateResponse }: OptionsParamsType = {}) {
        this.config = config;

        this.validateConfig = createValidator(validateConfig);
        this.validateResponse = createValidator(validateResponse);
    }

    readonly config: { [key: string]: any };
    readonly validateConfig: ValidatorType;
    readonly validateResponse: ValidatorType;

    merge(nextOptions: OptionsType): OptionsType {
        const { config = {}, validateConfig, validateResponse } = nextOptions;

        return new Options({
            config: {
                ...this.config,
                ...config,
            },
            validateConfig: this.validateConfig.merge(validateConfig),
            validateResponse: this.validateResponse.merge(validateResponse),
        });
    }
}

export type OptionsType = InstanceType<typeof Options>;
