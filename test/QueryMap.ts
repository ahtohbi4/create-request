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
                    {
                        pattern: '/{id}',
                        validate: ({ id }: any) => (typeof id !== 'number' || id < 0)
                            ? { id: 'Parameter "id" should be a positive number.' } : undefined,
                    },
                    {
                        validateConfig: () => undefined,
                    },
                    {
                        get: qm.apply(''),
                        update: qm.apply(
                            '',
                            {
                                config: { method: 'post' },
                                validateConfig: ({ body = {} } = {}) => (body.name === '')
                                    ? { name: 'Parameter "name" should be a non-empty string.' } : undefined,
                            },
                        ),
                    },
                ),
            },
        ),
    },
);

describe('Class QueryMap', () => {
    it('should return the expected map of queries', () => {
        expect(API).to.have.nested.property('projects.item.get');
        expect(API).to.have.nested.property('projects.item.update');
        expect(API).to.have.nested.property('projects.create');
        expect(API).to.have.nested.property('projects.getList');
    });

    it('should validate URL parameters correctly', () => {
        return API.projects.item.get({ id: -5 })
            .catch((error: any) => {
                expect(error).to.deep.equal({ id: 'Parameter "id" should be a positive number.' });
            });
    });

    it('should validate config correctly', () => {
        return API.projects.item.update({ id: 123 })
            .catch((error: any) => {
                expect(error).to.deep.equal({ name: 'Parameter "name" should be a non-empty string.' });
            });
    });

    it('should pass all validations', () => {
        return API.projects.item.update({ id: 123 }, { body: { name: 'Foo' } })
            .then(() => {
                expect(1).to.equal(1);
            });
    });
});
