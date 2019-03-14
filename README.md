# QueryMap

[![NPM version][version-img]][version-link] [![Status of devDependency][dependency-img]][dependency-link] [![Travis Build Status][travis-img]][travis-link]

[dependency-img]: https://david-dm.org/ahtohbi4/query-map/dev-status.svg
[dependency-link]: https://david-dm.org/ahtohbi4/query-map#info=devDependencies
[version-img]: https://badge.fury.io/js/query-map.svg
[version-link]: https://badge.fury.io/js/query-map
[travis-img]: https://travis-ci.org/ahtohbi4/query-map.svg?branch=master
[travis-link]: https://travis-ci.org/ahtohbi4/query-map

[fetch-spec-link]: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters

> — What a hell is that? :roll_eyes:

The library is to a declarative description of the map of requests to your REST API.

## Installation

```
$ npm install query-map --save
// or $ yarn add query-map
```

## Usage

> — Stop, dude! But why do I need in this "bicycle"? :thinking:

With the "bicycle" you can create a nested map of queries with an inheritance of configurations from level to level.

> — Ok, but how?

Well look:

#### 1. Create an instance

```javascript
const qm = new QueryMap(
    'https://example.com/api',
     { config: { headers: { 'Content-Type': 'application/json' } } }
 );
```

##### Syntax

```
new QueryMap([baseUrl, baseOptions]);
```

- `baseUrl` — a declaration of base URL (see *[URL description](#url-description)*);
- `[baseOptions]` — a base options for all nested queries:
  - `[baseOptions.config={}]` — a configuration of `fetch`-request (see [specification][fetch-spec-link]),
  - `[baseOptions.validateConfig]` — a function to validate the config before starting a request (see
*[Validation](#validation-url-params-result-config-and-response)*),
  - `[baseOptions.validateResponse]` — a function to validate response (see *[Validation](#validation-url-params-result-config-and-response)*).

#### 2. Describe a map of requests to your API as a tree using method `apply()`

> **Note!** The method doesn't mutate instance created above. It returns a new level of description.

```javascript
export const API = qm.apply('', {}, {
    projects: qm.apply('/projects', {}, {
        create: qm.apply('/create', {
            config: { method: 'put' },
            validateConfig: ({ body: { name } = {} }) => (typeof name === 'string' && name !== '') ? undefined : {
                name: 'Parameter "name" should be a non-empty string.',
            },
        }),
        get: qm.apply(''),
        item: qm.apply({
            pattern: '/{id}',
            validate: ({ id }) => (typeof id === 'number' && id > 0) ? undefined : {
                id: 'Parameter "id" should be a positive number.'
            },
        }, {}, {
            get: qm.apply(''),
            update: qm.apply('', { config: { method: 'post' } }),
        }),
    }),
});

console.dir(API);
// -> {
//     projects: {
//         create: (urlParams, config) => {...},
//         get: (urlParams, config) => {...},
//         item: {
//             get: (urlParams, config) => {...},
//             update: (urlParams, config) => {...},
//         }
//     }
// }
```

##### Syntax

```
<instanceof QueryMap>.apply(url[, options, subtree])
```

- `url` — a declaration of URL for the level (see *[URL description](#url-description)*);
- `[options]` — an object with:
  - `[options.config={}]` — a configuration of `fetch`-request (see [specification][fetch-spec-link]),
  - `[options.validateConfig]` — a function to validate the config before starting a request (see
*[Validation](#validation-url-params-result-config-and-response)*),
  - `[options.validateResponse]` — a function to validate response (see *[Validation](#validation-url-params-result-config-and-response)*);
- `[subtree]` — an object with nested queries declaration.

#### 3. Use the map

Now you can use the map:

```javascript
API.projects.item.get();
// -> Error: { id: 'Parameter "id" should be a positive number.' }

API.projects.item.get({ id: 42 });
// -> <Request 'GET https://example.com/api/projects/42'>

API.projects.item.update({ id: 42 }, { body: JSON.stringify({ name: 'A new name' }) });
// -> <Request 'POST https://example.com/api/projects/42'>
```

## URL description

A result URL of each query is built from the parts of each level starts from the root. The parts can be both static and
dynamic.

**The static** one is a simple string valid as a part of the URL. For example `/projects/create`.

```javascript
const qm = new QueryMap('https://example.com/api');
const getProjectsList = qm.apply('/projects');

getProjectsList();
// -> <Request 'GET https://example.com/api/projects'>
```

**The dynamic** one is the same string with special placeholders in braces. For example `/projects/{id}`. Pass the URL
parameters as an object when performing a request. If some of them will not be found in the URL-pattern it will be
passed as GET-parameters.

```javascript
const qm = new QueryMap('https://example.com/api');
const getProject = qm.apply('/projects/{id}');
const getProjectsList = qm.apply('/projects/page/{page=1}');

getProject({ id: 42, foo: 'baz' });
// -> <Request 'GET https://example.com/api/projects/42?foo=baz'>
getProjectsList();
// -> <Request 'GET https://example.com/api/projects/page/1'>
```

In addition, you can define a function to validate the URL parameters. In this case, instead of a string, you should
pass an object with the next parameters:

 - `pattern` — is the same string as seen above (static or dynamic part of the URL) and
 - `validate` — function to validate.

```javascript
const qm = new QueryMap('https://example.com/api');
const getProject = qm.apply({
    pattern: '/projects/{id}',
    validate: ({ id }) => (typeof id === 'number' && id > 0) ? undefined : {
        id: 'Parameter "id" should be a positive number.'
    },
});
```

For more details see section *[Validation](#validation-url-params-result-config-and-response)*.

## Validation (URL-params, result config and response)

You can validate:

- URL parameters by passing validation function as parameter `validate` in [URL description](#url-description);
- result config before request by passing validation function as parameter `validateConfig`;
- response object by passing validation function as parameter `validateResponse`.

The each kind of validator describing above is collected in a separate array from level to level. After you call a query
function the arrays will be applying at a certain point of its execution. It means that each of the validation function
from the arrays will be called and return `undefined` (if validation passed) or an object with errors.
