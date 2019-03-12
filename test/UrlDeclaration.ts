import { expect } from 'chai';
import 'mocha';

import UrlDeclaration from '../src/UrlDeclaration';

const PATH_A = new UrlDeclaration('/a');
const PATH_B = new UrlDeclaration({ pattern: '/b/{b=3}' });

const validateC = () => undefined;
const PATH_C = new UrlDeclaration({ pattern: '/c/{c}', validate: validateC });

const validateD = () => undefined;
const PATH_D = new UrlDeclaration({ pattern: '/d/{d}', validate: validateD });

describe('Class UrlDeclaration', () => {
    it('should returns expected instances', () => {
        expect(PATH_A).to.deep.equal({
            pattern: '/a',
            validate: { getValidate: undefined },
        });
        expect(PATH_B).to.deep.equal({
            pattern: '/b/{b=3}',
            validate: { getValidate: undefined },
        });
        expect(PATH_C).to.deep.equal({
            pattern: '/c/{c}',
            validate: { getValidate: [validateC] },
        });
    });

    it('should returns expected interpolated values by method interpolate()', () => {
        expect(PATH_A.interpolate({ a: 'A' })).to.equal('/a?a=A');
        expect(PATH_B.interpolate({ a: 'A', b: 'B' })).to.equal('/b/B?a=A');
        expect(PATH_B.interpolate({ a: 'A' })).to.equal('/b/3?a=A');
    });

    it('should returns expected patterns by method toString()', () => {
        expect(PATH_A.toString()).to.equal('/a');
        expect(String(PATH_B)).to.equal('/b/{b=3}');
    });

    it('should returns new expected instances by method merge()', () => {
        expect(PATH_A.merge(PATH_B)).to.deep.equal({
            pattern: '/a/b/{b=3}',
            validate: { getValidate: undefined },
        });
        expect(PATH_A.merge(PATH_C)).to.deep.equal({
            pattern: '/a/c/{c}',
            validate: { getValidate: [validateC] },
        });
        expect(PATH_C.merge(PATH_D)).to.deep.equal({
            pattern: '/c/{c}/d/{d}',
            validate: { getValidate: [validateC, validateD] },
        });
        expect(PATH_A.merge(PATH_C.merge(PATH_D))).to.deep.equal({
            pattern: '/a/c/{c}/d/{d}',
            validate: { getValidate: [validateC, validateD] },
        });
    });
});
