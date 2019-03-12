import { expect } from 'chai';
import 'mocha';

import Options from '../src/Options';

const validateA = ({ a }: any) => a ? undefined : ({ a: 'Invalid parameter a' });
const validateB = ({ b }: any) => b ? undefined : ({ b: 'Invalid parameter b' });

const OPTIONS_A = new Options();
const OPTIONS_B = new Options({ config: { method: 'post' } });
const OPTIONS_C = new Options({ config: { method: 'put' }, validateConfig: validateA });
const OPTIONS_D = new Options({ validateConfig: validateB, validateResponse: validateB });

describe('Class Options', () => {
    it('should returns expected instances', () => {
        expect(OPTIONS_A.merge(OPTIONS_B)).to.deep.equal({
            config: { method: 'post' },
            validateConfig: { getValidate: undefined },
            validateResponse: { getValidate: undefined },
        });
        expect(OPTIONS_C.merge(OPTIONS_D)).to.deep.equal({
            config: { method: 'put' },
            validateConfig: { getValidate: [validateA, validateB ] },
            validateResponse: { getValidate: [validateB] },
        });
        expect(OPTIONS_B.merge(OPTIONS_C)).to.deep.equal({
            config: { method: 'put' },
            validateConfig: { getValidate: [validateA] },
            validateResponse: { getValidate: undefined },
        });
    });
});
