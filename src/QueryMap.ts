import Options, { OptionsParamsType, OptionsType } from './Options';
import UrlDeclaration, { UrlDeclarationType } from './UrlDeclaration';

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
        this.baseUrl = new UrlDeclaration(baseUrl);
        this.baseOptions = new Options(baseOptions);
    }

    private readonly baseUrl: UrlDeclarationType;
    private readonly baseOptions: OptionsType;

    apply(url: UrlType, options?: OptionsParamsType, subtree?: { [key: string]: any }): any {
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
        const levelUrl = new UrlDeclaration(url);

        return (...params: Array<ConfigType & OptionsType & UrlParamsType & UrlType & boolean>) => {
            const [options] = rest;
            const [, , isService] = params;

            if (isService as boolean) {
                const [subLevelUrl, subLevelOptions] = params;

                return this.createRequest(
                    (new UrlDeclaration(subLevelUrl)).apply(levelUrl),
                    (new Options(subLevelOptions)).apply(new Options(options)),
                );
            }

            const [urlParams = {}, config] = params;

            return new Promise((resolve, _reject) => {
                setTimeout(() => resolve({
                    options: this.baseOptions
                        .apply(new Options(options))
                        .apply(new Options({ config })),
                    url: this.baseUrl.apply(levelUrl).interpolate(urlParams),
                }), 1000);
            });
        };
    }
}
