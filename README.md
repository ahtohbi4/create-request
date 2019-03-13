# QueryMap

You:

> — What a hell is that? :roll_eyes:

The library is to a declarative description of the map of requests to your REST API.

## Installation

```
$ npm install query-map --save
// or $ yarn add query-map
```

## Usage

You:

> — Stop, dude! But why do I need in this "bicycle"? :thinking:

With the "bicycle" you can create a nested map of queries with an inheritance of configurations from level to level.

You:

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

- `baseUrl` — a string as a base part of compound URL or object with:
  - `baseUrl.pattern` — a string as a base part of compound URL,
  - `[baseUrl.validate]` — a function to validate URL parameters (see *[Validation](#validation)*);
- `[baseOptions]` — a base options for all nested queries:
  - `[baseOptions.config={}]` — a configuration of `fetch`-request (see [specification][link to fetch spec]),
  - `[baseOptions.validateConfig]` — a function to validate the config before starting a request (see
*[Validation](#validation)*),
  - `[baseOptions.validateResponse]` — a function to validate response (see *[Validation](#validation)*).

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
// => {
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

- `url` — a string as a part of compound URL or object with:
  - `url.pattern` — a string as a part of compound URL,
  - `[url.validate]` — a function to validate URL parameters (see *[Validation](#validation)*);
- `[options]` — an object with:
  - `[options.config={}]` — a configuration of `fetch`-request (see [specification][link to fetch spec]),
  - `[options.validateConfig]` — a function to validate the config before starting a request (see
*[Validation](#validation)*),
  - `[options.validateResponse]` — a function to validate response (see *[Validation](#validation)*);
- `[subtree]` — an object with nested queries declaration.

#### 3. Use the map

## URL description

A result URL of each query is built from the parts of each level starts from the root. The parts can be both static and
dynamic.

**The static** one is a simple string valid as a part of the URL. For example `/projects/create`.

```javascript
const qm = new QueryMap('https://example.com/api');
const getProjectsList = qm.apply('/projects');

// getProjectsList() => Request to https://example.com/api/projects
```

**The dynamic** one is the same string with special placeholders in braces. For example `/projects/{id}`. Pass the URL
parameters as an object when performing a request. If some of them will not be found in the URL-pattern it will be
passed as GET-parameters.

```javascript
const qm = new QueryMap('https://example.com/api');
const getProject = qm.apply('/projects/{id}');
const getProjectsList = qm.apply('/projects/page/{page=1}');

// getProject({ id: 42, foo: 'baz' }) => Request to https://example.com/api/projects/42?foo=baz
// getProjectsList() => Request to https://example.com/api/projects/page/1
```

In addition, you can define a function to validate the URL parameters. In this case, instead of a string, you should
pass an object with the next parameters:

 * `pattern` — is the same string as seen above (static or dynamic part of the URL) and
 * `validate` — function to validate (see *[Validation](#validation)*).

```javascript
const qm = new QueryMap('https://example.com/api');
const getProject = qm.apply({
    pattern: '/projects/{id}',
    validate: ({ id }) => (typeof id === 'number' && id > 0) ? undefined : {
        id: 'Parameter "id" should be a positive number.'
    },
});
```

## Validation

...

[link to fetch spec]: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
