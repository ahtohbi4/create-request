import { expect } from 'chai';
import 'mocha';

import Validator from '../src/Validator';

const validateA = undefined;
const validateB = ({ b }: any) => b ? undefined : ({ b: 'Invalid parameter b' });
const validateC = ({ c }: any) => c ? undefined : ({ c: 'Invalid parameter c' });

const validatorA = new Validator(validateA);
const validatorB = new Validator(validateB);
const validatorC = new Validator(validateC);

describe('Class Validator', () => {
    it('should returns expected instances', () => {
        expect(validatorA.merge(validatorA)).to.deep.equal({ getValidate: undefined });
        expect(validatorA.merge(validatorB)).to.deep.equal({ getValidate: [validateB] });
        expect(validatorB.merge(validatorC)).to.deep.equal({ getValidate: [validateB, validateC] });
    });

    it('should be applied correctly', () => {
        expect(validatorB.merge(validatorC).apply({})).to.deep.equal({
            b: 'Invalid parameter b',
            c: 'Invalid parameter c',
        });
        expect(validatorB.merge(validatorC).apply({ b: 1 })).to.deep.equal({
            c: 'Invalid parameter c',
        });
        expect(validatorB.merge(validatorC).apply({ b: 1, c: 1 })).to.equal(undefined);
    });
});
