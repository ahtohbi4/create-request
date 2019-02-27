import interpolate from './interpolate';

type ValidatorType = (value: { [key: string]: any }) => undefined | { [key: string]: string };

interface UrlDeclarationType {
    pattern: string;
    validate?: ValidatorType;
}

type UrlType = string | UrlDeclarationType;

interface ConfigType {}

interface OptionsType {
    config?: ConfigType;
    validateConfig?: ValidatorType;
    validateResponse?: ValidatorType;
}

interface UrlParamsType {
    [key: string]: number | string;
}

function createRequest<U extends string>(url: U, options?: OptionsType): (config?: ConfigType) => Promise<any>;
function createRequest<U extends UrlDeclarationType>(url: U, options?: OptionsType):
    (UrlParams: UrlParamsType, config?: ConfigType) => Promise<any>;

function createRequest(url: UrlType, options: OptionsType = {}) {
    return (...params: Array<UrlParamsType & ConfigType>) => new Promise((resolve, reject) => {
        let resultUrl;
        let config;

        if (typeof url === 'string') {
            resultUrl = url;
            [config] = params;
        } else {
            const { pattern, validate: validateUrlParams } = url;
            let urlParams;
            [urlParams, config] = params;

            const urlParamsErrors = validateUrlParams ? validateUrlParams(urlParams) : undefined;

            if (urlParamsErrors) {
                reject(urlParamsErrors);
            }

            resultUrl = interpolate(pattern, urlParams);
        }

        const { config: baseConfig, validateConfig } = options;

        const resultConfig = {
            ...baseConfig,
            ...config,
        };
        const configErrors = validateConfig ? validateConfig(resultConfig) : undefined;

        if (configErrors) {
            reject(configErrors);
        }

        resolve({resultConfig, resultUrl});
    })
        .then(({ resultConfig, resultUrl }: { [key: string]: any }) => fetch(resultUrl, resultConfig))
        .then((response: any) => {
            const { validateResponse } = options;

            const responseErrors = validateResponse ? validateResponse(response) : undefined;

            if (responseErrors) {
                throw new Error(responseErrors.toString());
            }

            return response;
        });
}

export default createRequest;
