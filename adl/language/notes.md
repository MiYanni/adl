TODO:
- support swagger top-level information
```
  "swagger": "2.0",
  "info": {
    "title": "AutoRest Integer Test Service",
    "description": "Test Infrastructure for AutoRest",
    "version": "1.0.0"
  },
  "host": "localhost:3000",
  "schemes": [
    "http"
  ],
  "produces": [
    "application/json"
  ],
  "consumes": [
    "application/json"
  ],
```
- support boolean literals in type system
- emit string/number/boolean literal types as enums
- support null literal
- support x-ms-examples
- support tags
- support Ok/Error (return type) description


Confusing:
- translation of function names (read, createOrUpdate, list, etc) to HTTP method types (GET, PUT, PATCH, etc)
- inline declaration of schemas? (ref counting strategy)
- is every different path a different interface?
  - what do interface names do? (use as operation group name?)
- how to map response codes (200, 201, etc) to responses (and default)
- do not output models that represent responses
  - responses have a schema, and they are not a schema themselves
- every parameter is defined as global?!?!!?
- integers become `number` (meaning, integers becomes a decimal instead of integer)