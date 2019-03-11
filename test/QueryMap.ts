import { expect } from 'chai';
import 'mocha';

import QueryMap from '../src/QueryMap';

const qm = new QueryMap('https://payment.platbox.com/api');
const API = qm.apply(
    '',
    {},
    {
        projects: qm.apply(
            '/projects',
            {
                config: { method: 'get' },
            },
            {
                create: qm.apply('/create', { config: { method: 'put' } }),
                getList: qm.apply(''),
                item: qm.apply(
                    '/{id}',
                    {
                        validateConfig: () => undefined,
                    },
                    {
                        get: qm.apply(''),
                        update: qm.apply(
                            '',
                            {
                                config: { method: 'post' },
                                validateConfig: () => ({ f: 'f' }),
                            },
                        ),
                    },
                ),
            },
        ),
    },
);

describe('Class QueryMap', () => {
    it('should returns the expected map of queries', () => {
        expect(API).to.have.nested.property('projects.item.get');
        expect(API).to.have.nested.property('projects.item.update');
        expect(API).to.have.nested.property('projects.create');
        expect(API).to.have.nested.property('projects.getList');
    });
});
