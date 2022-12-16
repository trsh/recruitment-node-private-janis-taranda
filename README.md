# recruitment-node-private-janis-taranda

## Setup & Run

- Install [NodeJS](https://nodejs.org/en/) lts or latest version
- Install [Docker](https://www.docker.com/get-started/)
- In root dir run `npm install`
- In root dir run `docker-compose up` to setup postgres docker image for local development
- Create a .env file with the content from .env.test and set your `GOOGLE_MAPS_API_KEY` and other parameters id need so
- In root dir run migrations `npm run migration:run `
- In root dir run seed migrations `npm run migration:revert:seed`
- In root dir run `npm run start`
- Url & script (`scripts\scripts.ts`) tasks results are printed in console

## Testing API

- In browser open `${config.APP_PROTOCOL}://${config.APP_HOST}:${config.APP_PORT}/swagger` (user and password is in `.env`)
- Check out the API documentation
- (optional) Swagger is not great for testing, better use Postman
- First you want to use is `/login` to get the access token
- Once you have the access token, use it for every next API call in header `Authorization: Bearer ${token}`
- (Note) You will be able to modify only owned Farm

### Special comments

- I used Express.js tools/libs to make REST API development more efficient and showcase my skill to not reinvent the wheel. Next time I would make few alternative choices for some libs, but this also works. And would suggest more robust framework like NestJS for real project.
- Swagger documentation is also avaiable on `http://localhost:3001/swagger/`. Has some bugs, but nothing crticial.
- Search in project for phrase "todo", you will some comments, things that I wanted to implement but was short on time.
- I did not create unit or other tests as I feel it's out of the scope of a >5d hometask. Same for properly commenting the code, doing deep optimizations and code generalization, etc. In other words - this code base doesn't represent a full blown end product, but I did my best with the time & motivation I had.