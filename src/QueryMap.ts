type ValidatorType = (value: { [key: string]: any }) => undefined | { [key: string]: string };

type UrlSimpleType = string;

interface UrlDeclarationType {
    pattern: string;
    validate?: ValidatorType | ValidatorType[];
}

type UrlType = UrlSimpleType | UrlDeclarationType;

class QueryMap {
    constructor(url = '', options = {}) {
        this.baseUrl = url;
        this.baseOptions = options;

        return this;
    }

    apply(url, options, subtree) {
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

    createRequest(url, options) {
        return (...params) => {
            const [, , isService] = params;

            if (isService) {
                const [baseUrl, baseOptions = {}] = params;

                return this.createRequest(`${baseUrl}${url}`, { ...baseOptions, ...options })
            }

            const [urlParams = {}] = params;
            const resultUrl = this.baseUrl + Object.entries(urlParams)
                .reduce((result, [key, value]) => result.replace(`{${key}}`, value), url);

            return new Promise((resolve, reject) => {
                setTimeout(() => resolve({ url: resultUrl, options: { ...this.baseOptions, ...options } }), 2000);
            });
        };
    }
}
