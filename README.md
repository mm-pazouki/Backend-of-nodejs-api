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

# production mode
$ npm run start:prod
```
## Configure the connections

    Open the *'.env.example'* file and Change smtp, db_uri, bruker_url.

### Postman API 

1. POST /api/users  
2. GET /api/user/{userId}  
3. GET /api/user/{userId}/avatar  
4. DELETE /api/user/{userId}/avatar  

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Mohammad Mehdi Pazouki](https://www.github.com/mm-pazouki)
## License

Nest is [MIT licensed](LICENSE).
