<div align="center">

# Solar Drying System

</div>

> [!NOTE]
> Follow the setup properly to use the system as expected.

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

### Register

> POST /users/register

_This endpoint makes an HTTP POST request to create a new user._

#### Form data

| Name                | Location | Type    | Required |
| ------------------- | -------- | ------- | -------- |
| first_name          | body     | varchar | yes      |
| middle_name         | body     | varchar | yes      |
| last_name           | body     | varchar | yes      |
| email               | body     | varchar | yes      |
| password            | body     | varchar | yes      |
| role                | body     | varchar | yes      |
| address             | body     | varchar | yes      |

#### Response

| HTTP Status Code | Description                                             |
| ---------------- | ------------------------------------------------------- |
| 201              | Successdul creation of an user.                         |
| 400              | User already exist.                       |
| 500              | Unsuccessful creation of an user.                       |

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

-   React✨
-   Tailwind
-   Node
-   Express
-   Supabase
-   PostgreSQL