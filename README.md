<div align="center">

![](./FRONTEND/public/logo.png)

# Solar Drying System

</div>

> [!TIP]
> Use latest node version (24.1.0).

> [!CAUTION]
> Follow the setup properly to use the system as expected.

## Setup

Rename the `.env.sample` to `.env`, then fill up the environment variables.

Open a terminal connected to the project source directory - `Shortcut key:` Ctrl + `

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

Open a new terminal connected to the project source directory - `Shortcut key:` Ctrl + Shift + `

```bash
  cd .\BACKEND\
```

Install dependecies for back-end

```bash
  npm i
```

Run the project's back-end

```bash
  npm start
```

_This will handle the behind-the-scene proccesses of the opened tab in default browser._

## API endpoints

### Register

> POST /users/register

_This endpoint makes an HTTP POST request to create a new user._

#### Form data

| Name        | Location | Type    | Required |
| ----------- | -------- | ------- | -------- |
| first_name  | body     | varchar | yes      |
| middle_name | body     | varchar | yes      |
| last_name   | body     | varchar | yes      |
| email       | body     | varchar | yes      |
| password    | body     | varchar | yes      |
| role        | body     | varchar | yes      |
| address     | body     | varchar | yes      |

#### Response

| HTTP Status Code | Description                      |
| ---------------- | -------------------------------- |
| 201              | Successful creation of a user.   |
| 400              | User already exists.             |
| 500              | Unsuccessful creation of a user. |

#### Sample Response

```json
{
    "message": [
        {
            "Registered successfully. Please verify with OTP."
        }
    ],
    "message": [
        {
            "Email already exists."
        }
    ],
    "message": [
        {
            "Registration failed."
        }
    ]
}
```

## Built with

- React ✨
- Tailwind ✨
- Node JS ✨
- Express JS ✨
- Supabase ✨
- PostgreSQL ✨
