import { expect } from 'chai';
import 'mocha';

import UrlDeclaration from '../src/UrlDeclaration';

const PATH_A = new UrlDeclaration('/a');
const PATH_B = new UrlDeclaration({ pattern: '/b/{b}' });

const validateC = () => true;
const PATH_C = new UrlDeclaration({ pattern: '/c/{c}', validate: validateC });

const validateD = () => true;
const PATH_D = new UrlDeclaration({ pattern: '/d/{d}', validate: validateD });

describe('Class UrlDeclaration', () => {
    it('should returns expected instances', () => {
        expect(PATH_A).to.deep.equal({ pattern: '/a' });
        expect(PATH_B).to.deep.equal({ pattern: '/b/{b}' });
        expect(PATH_C).to.deep.equal({
            pattern: '/c/{c}',
            validate: validateC,
        });
    });

    it('should returns new expected instances by method apply()', () => {
        expect(PATH_A.apply(PATH_B)).to.deep.equal({ pattern: '/a/b/{b}' });
        expect(PATH_A.apply(PATH_C)).to.deep.equal({ pattern: '/a/c/{c}', validate: validateC });
        expect(PATH_C.apply(PATH_D)).to.deep.equal({ pattern: '/c/{c}/d/{d}', validate: [validateC, validateD] });
    });
});
