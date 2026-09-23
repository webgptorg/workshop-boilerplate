Implement the first version of the app "Společný stůl"


- Take the [business idea](docs/00-surovy-napad.txt)
    - Analyze the business and all other subdocuments linked in `docs/`
- You are starting from the boilerplate project. Just discard the things which are in the project and implement the first version of the app. 


## Branding

This is how logo, fonts and colors should look like:
![Logo, fonts and colors](image.png)


## Meals

- Each meal should have its own icon. 
- Get inspiration from real [meals](docs/stavajici_jidelnicky.txt)
- For each day, there should be 2 meals:
    - Primary
    - Alternative if the primary meal is not suitable


## User personas

The app should be designed for all varieties of users: pupils, school restaurant staff, and parents so the design patterns should be universal. 

## Users

- There is no database, but prepare three mocked users:
    1) the pupil
    2) the restaurant staff
    3) the parent

For each of these, there should be a fake username/password. 

## User roles

The app should work in three distinct roles. Each role should have its custom color tint and functions. 

### Pupil

The pupil role should have access to view the weekly meal plan, select preferred meals, and provide feedback on meals.

### Restaurant staff

The restaurant staff role should have access to manage the weekly meal plan, update meal information, and view feedback from pupils.

### Parent

The parent role should have access to view their child's weekly meal plan, provide feedback, and manage meal preferences.

## Data

- Do not implement the database. The data should be just stored in the local storage / indexed DB for now. 


## Automated checks

The `npm run check` command should be used to run all automated checks.


## Coding standards


RULE
Do not write taglines or texts which are meaningless


**For example do not do this:**

```
S CHUTÍ DO NOVÉHO TÝDNE
Týdenní jídelníček.
Pestrý týden pro děti. Méně starostí pro vás.
```

**But do this:**

```
Týdenní jídelníček.
```


Do not write texts like "Návrh máte ve svých rukou" in badges



RULE
Keep in mind the SOLID principles.

RULE
Do a proper analysis of the current functionality before you start implementing.

RULE
Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.

RULE
When throwing errors, throw [branded errors](src/errors) and use `spaceTrim` utility to write clear and well-formatted multiline detailed error messages.
Format errors as markdown, for example `variables` should be in backticks and important notes can be in bold.

RULE
Constants should always be `UPPER_SNAKE_CASE`.

RULE
Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.

RULE
Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.

