export type ValidatorType = (values: any) => (true | { [key: string]: string });

export default (...validators: Array<ValidatorType | ValidatorType[] | any>): (ValidatorType | ValidatorType[]) => {
    const merged = validators.reduce((result: ValidatorType[], validator): ValidatorType[] => ([
        ...result,
        ...((validator)
            ? Array.isArray(validator)
                ? validator
                : [validator]
            : []),
    ]), []);

    if (merged.length < 2) {
        return merged[0];
    }

    return merged;
};
