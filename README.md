# Oscar Predictions App

this is an app I made in react for some friends oscar party in march. going to continue my work eventually to either make it an app or make it update with next years answers and fix some bugs.

## what it does

- you can make predictions
- there's a leaderboard to compare
- admin can update winners in real time during the show
- fetches movie posters / nominees from tmdb

## how to run this thing

### backend
```bash
cd backend
npm install
npm start
```

runs on port 5001. has all the api endpoints

### frontend  
```bash
cd oscar-frontend
npm install  
npm start
```

runs on port 3000. react app with all the ui components.

make sure you start backend first or the frontend will just be sad and not work.

## stack

- react (frontend)
- node/express (backend) 
- socket.io (real-time stuff)
- tmdb api (movie data)
- js-cookie (for remembering users)
- bunch of other npm packages

## files structure

```
backend/
├── server.js          // main server file
├── routes/            // api routes
├── data/              // json files for storage
└── package.json

oscar-frontend/
├── src/
│   ├── App.js         // main component
│   ├── components/    // ui components
│   └── ...
└── package.json
```

## environment stuff

you need a tmdb api key for the movie images. currently hardcoded because its a public key.

## deployment 

backend serves the built frontend so just run `npm run build`  and `npm start` and start the backend using `node server.js`

## known issues

- images can take some time to load so may be good to cache or get at server runtime
- no proper database but planning to move to firebase
- code should be broken out

## disclaimer

i made this in a weekend, but I really want to make it better for the upcoming award seasons!
