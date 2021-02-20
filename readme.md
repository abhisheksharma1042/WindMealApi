# WindMeal API

> Backend API for WindMeal application, which is a local farm directory website.

## Usage

Rename "config/config.env.env" to "config/config.env" and update values/settings to your own.

## Install Dependencies

```
npm install
```

## Run App

```
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the "\_data" folder, run

```
# Destroy all data
node seeder -d

# Import all data
node seeder -i
```

## Info

- Version: 1.0.0
- License: MIT
- Author: Abhishek Sharma
