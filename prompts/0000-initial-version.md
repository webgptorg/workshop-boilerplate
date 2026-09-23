[x]

Implement the first version of the app "Společný stůl"


- Take the [business idea](docs/00-surovy-napad.txt)
    - Analyze the business and all other subdocuments linked in `docs/`
- You are starting from the boilerplate project. Just discard the things which are in the project and implement the first version of the app. 

## Branding

This is how logo, fonts and colors should look like:
![Logo, fonts and colors](image.png)

- Create a branding manual including logo, fonts, and color scheme, examples,... at `docs/branding`


## Meals

- Each meal should have its own icon. 
- Get inspiration from real [meals](docs/stavajici_jidelnicky.txt)
- For each day, there should be 2 meals:
    - Primary
    - Alternative if the primary meal is not suitable


## User personas

The app should be designed for all varieties of users: pupils, school restaurant staff, and parents so the design patterns should be universal. 

## Users

- Prepare three mocked users:
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

- Use the SQLite database.
