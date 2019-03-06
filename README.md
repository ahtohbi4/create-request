# query-map

> Utility to declarative describing queries to API with a possibility of validating request and response items.

## Installation

### npm

```
$ npm install query-map --save
```

### yarn

```
$ yarn add query-map
```

## Usage

### Create an instance

```javascript
const qm = new QueryMap('https://example.com', { headers: { 'Content-Type': 'application/json' } });
```

##### Syntax

```
new QueryMap([baseUrl, baseOptions]);
```

- `baseUrl` — string as a part of compound URL or object with:
  - `baseUrl.pattern` — string as a part of compound URL,
  - `baseUrl.validate` — function to validate URL parameters;
- `baseOptions` — an object with:
  - `baseOptions.config` — configuration of `fetch`-request ([see spec](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)),
  - `baseOptions.validateConfig` — some.
  - `baseOptions.validateResponse` — some.

### Extend the API description by method `.apply()`.

> **Note!** The method doesn't mutate instance created above. It returns a new level of description.

```javascript
const API = qm.apply('/api', {}, {
    projects: qm.apply('/projects', {}, {
        create: qm.apply('/create', { config: { method: 'post' } }),
        getById: qm.apply('/{id}'),
        getList: qm.apply(''),
        update: qm.apply('/{id}', { config: { method: 'put' } }),
    }),
});
```

#### Syntax

```
<instanceof QueryMap>.apply(url[, options, subtree])
```

- `url` — string as a part of compound URL or object with:
  - `url.pattern` — string as a part of compound URL,
  - `url.validate` — function to validate URL parameters;
- `options` — an object with:
  - `options.config` — configuration of `fetch`-request ([see spec](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)),
  - `options.validateConfig` — some.
  - `options.validateResponse` — some.
- `subtree` — an object with nested queries declaration.

### Result

Now in the ends of each branch you have a function returns a `fetch`-request by URL parameters and config:

```
API => {
    projects: {
        create: (urlParams, config) => fetch('https://example.com/api/projects/create', { method: 'post', ...config }),
        getById: (urlParams, config) => fetch('https://example.com/api/projects/{id}', config),
        getList: (urlParams, config) => fetch('https://example.com/api/projects/create', config),
        update: (urlParams, config) => fetch('https://example.com/api/projects/{id}', { method: 'put', ...config }),
    },
};
```

So, all of the API queries describe in one object and have a nested structure. You can define/redefine config or
validations for URL parameters, config, and response for each level. Use this object to generate requests to API:

```javascript
API.projects.getById({ id: 123 })
    .then((response) => { /* do something... */ });
```

#### Syntax

```
([urlParams, config]) => <Promise>
```

### Validating

```javascript
import QueryMap from 'query-map';

const qm = new QueryMap('https://example.com');

const API = qm.apply('/api', {}, {
    createProject: qm.apply('/projects/create', { config: { method: 'put' } }),
    getProjectById: qm.apply('/projects/{id}'),
    getProjects: qm.apply('/projects'),
    updateProject: qm.apply('/project/{id}', { config: { method: 'post' } }),
});


```
