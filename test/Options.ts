import { expect } from 'chai';
import 'mocha';

import Options from '../src/Options';

const validateA = ({ a }: any) => a ? true : ({ a: 'Invalid parameter a' });
const validateB = ({ b }: any) => b ? true : ({ b: 'Invalid parameter b' });

const OPTIONS_A = new Options();
const OPTIONS_B = new Options({ config: { method: 'post' } });
const OPTIONS_C = new Options({ config: { method: 'put' }, validateConfig: validateA });
const OPTIONS_D = new Options({ validateConfig: validateB, validateResponse: validateB });

describe('Class Options', () => {
    it('should returns expected instances', () => {
        expect(OPTIONS_A.apply(OPTIONS_B)).to.deep.equal({
            config: { method: 'post' },
            validateConfig: undefined,
            validateResponse: undefined,
        });
        expect(OPTIONS_C.apply(OPTIONS_D)).to.deep.equal({
            config: { method: 'put' },
            validateConfig: [validateA, validateB],
            validateResponse: [validateB],
        });
        expect(OPTIONS_B.apply(OPTIONS_C)).to.deep.equal({
            config: { method: 'put' },
            validateConfig: [validateA],
            validateResponse: undefined,
        });
    });
});
