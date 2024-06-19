## Description

This project uses Github REST API for scanning repositories. SQlite is used as data storage.

See .env.example for configuration.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```


## Functionality

This GraphQL API supports 2 queries: List repositories and Repository details.

List Repositories includes next properties:
- url
- name
- owner
- size

Repository Details includes next properties:
- url
- name
- owner
- size
- isPrivate
- filesCount
- firstYamlContent
- activeWebhooks
  - url

## Usage examples

Go to http://localhost:4000/graphql and try next queries:
1. List Repositories
```
query {
  repositories {
    url,
    name,
    size,
    owner,
  }
}
```
2. Repository Details
```
query {
  repositoryWithYaml: repository(url: "github.com/seclace/glowing-octo-fiesta") {
    url,
    name,
    size,
    owner,
    isPrivate,
    filesCount,
    firstYamlContent,
    activeWebhooks {
      url,
    },
  }
  repositoryWithWebhooks: repository(url: "github.com/seclace/sturdy-octo-memory") {
    url,
    name,
    size,
    owner,
    isPrivate,
    filesCount,
    firstYamlContent,
    activeWebhooks {
      url,
    },
  }
}
```
