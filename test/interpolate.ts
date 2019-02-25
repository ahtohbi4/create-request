import { expect } from 'chai';
import 'mocha';

import interpolate from '../src/interpolate';

describe('The function interpolate()', () => {
    it('should returns the same pattern if no parameters were passed', () => {
        expect(interpolate('Some string with {foo} and { baz }.'))
            .to.equal('Some string with {foo} and { baz }.');
    });

    it('should passes parameters to the pattern string', () => {
        expect(interpolate('Some string with {foo} and { baz }.', { baz: 'something else' }))
            .to.equal('Some string with {foo} and something else.');
    });

    it('should passes default parameters if not passed', () => {
        expect(interpolate('Some string with {foo = 42} and { baz }.', { baz: 'something else' }))
            .to.equal('Some string with 42 and something else.');
    });
});
