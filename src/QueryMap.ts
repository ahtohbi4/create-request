import Options, { OptionsParamsType, OptionsType } from './Options';
import { createUrlDeclaration, UrlDeclarationType } from './UrlDeclaration';

type UrlSimpleType = string;

type UrlType = UrlSimpleType | UrlDeclarationType;

interface UrlParamsType {
    [key: string]: number | string;
}

interface ConfigType {
    [key: string]: any;
}

export default class QueryMap {
    constructor(baseUrl: UrlType = '', baseOptions: OptionsParamsType = {}) {
        this.baseUrl = createUrlDeclaration(baseUrl);
        this.baseOptions = new Options(baseOptions);
    }

    private readonly baseUrl: UrlDeclarationType;
    private readonly baseOptions: OptionsType;

    apply(url: any, options?: OptionsParamsType, subtree?: { [key: string]: any }): any {
        if (subtree) {
            return Object.entries(subtree)
                .reduce((result, [key, branch]) => {
                    return {
                        ...result,
                        [key]: (typeof branch === 'function')
                            ? branch(url, options, true)
                            : this.apply(url, options, branch),
                    };
                }, {});
        }

        return this.createRequest(url, options);
    }

    private createRequest<U extends UrlType, O extends OptionsType>(url: U, options?: O):
        <F extends boolean>(levelUrl: U, levelOptions: O, isService: F) => Promise<any>;
    private createRequest<U extends UrlType, O extends OptionsType>(url: U, options?: O):
        (subOptions?: O) => Promise<any>;
    private createRequest<U extends UrlType, O extends OptionsType>(url: U, options?: O):
        (config?: ConfigType) => Promise<any>;

    private createRequest<U extends UrlType, O extends OptionsParamsType>(url: U, options?: O):
        (urlParams: UrlParamsType, subOptions?: O) => Promise<any>;
    private createRequest<U extends UrlType, O extends OptionsParamsType>(url: U, options?: O):
        (urlParams: UrlParamsType, config?: ConfigType) => Promise<any>;

    private createRequest(url: UrlType, ...rest: Array<OptionsType | ConfigType>) {
        const levelUrl = createUrlDeclaration(url);

        return (...params: Array<ConfigType & OptionsType & UrlParamsType & UrlType & boolean>) => {
            const [options] = rest;
            const [, , isService] = params;

            if (isService as boolean) {
                const [subLevelUrl, subLevelOptions] = params;

                return this.createRequest(
                    (createUrlDeclaration(subLevelUrl)).merge(levelUrl),
                    (new Options(subLevelOptions)).merge(new Options(options)),
                );
            }

            const [urlParams = {}, config] = params;

            return new Promise((resolve, reject) => {
                const resultUrlDeclaration = this.baseUrl.merge(levelUrl);
                const urlParamsErrors = resultUrlDeclaration.validate.apply(urlParams);

                if (urlParamsErrors) {
                    reject(urlParamsErrors);
                }

                const resultOptions = this.baseOptions
                    .merge(new Options(options))
                    .merge(new Options({ config }));
                const optionsError = resultOptions.validateConfig.apply(resultOptions.config);

                if (optionsError) {
                    reject(optionsError);
                }

                resolve({
                    options: resultOptions,
                    url: resultUrlDeclaration.interpolate(urlParams),
                });
            });
        };
    }
}
