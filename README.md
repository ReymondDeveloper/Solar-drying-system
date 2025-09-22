<div align="center">

# Solar Drying System

</div>

## Setup

Open a terminal - `Shortcut key:` Ctrl + `

```bash
  cd .\FRONTEND\`
```

Install dependecies for front-end

```bash
  npm i
```

Run the project's' front-end

```bash
  npm run dev
```

_This will open a tab in default browser._

Open a new terminal - `Shortcut key:` Ctrl + Shift + `

```bash
  cd .\BACKEND\
```

Install dependecies for back-end

```bash
  npm i
```

Run the project's back-end

```bash
  npm run start
```

_This will handle the behind-the-scene proccesses of the opened tab in default browser._

## API endpoints

> POST /users/register

_This endpoint makes an HTTP POST request to create a new user._

### Form data

| Name                | Location | Type    | Required |
| ------------------- | -------- | ------- | -------- |
| first_name          | body     | varchar | yes      |
| middle_name         | body     | varchar | yes      |
| last_name           | body     | varchar | yes      |
| email               | body     | varchar | yes      |
| password            | body     | varchar | yes      |
| role                | body     | varchar | yes      |
| address             | body     | varchar | yes      |

### Responses

| HTTP Status Code | Description                                             |
| ---------------- | ------------------------------------------------------- |
| 200              | Successdul creation of an user.                         |
| 500              | Unsuccessdul creation of an user.                       |

## Built with

-   React✨
-   Tailwind
-   Node
-   Express
-   Supabase
-   PostgreSQL