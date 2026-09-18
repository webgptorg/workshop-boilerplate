[ ]

Create a system for migrations.

- Migrations should be applied on the localstorage.
- When there are multiple migrations which need to be applied, apply them one by one.
- Create a system for these migrations, Each migration should be a Typescript function, which transforms the old version to new version in folder `migrations`.
- The migrations should work per-world. Migration should be applied only when it's needed.
- Always preserve last migration state here, the garbage collecting will be implemented later.
- You are now creating both the migration from version 3 to version 4 and system for these migrations which will be used in all future version upgrades.
- Now there is a version of the world v3, We want to do v4 and implement system of migrations.


**This is how the world data looks like in version 3:**

```json
{"id":"a","name":"A","createdAt":1789743100810,"updatedAt":1789743342616,"state":{"version":3,"seed":3111309898,"edits":[[-41,1,-13,1],[-41,1,-12,1],[-41,2,-12,1],[-42,1,-12,1],[-42,1,-11,1],[-42,1,-10,1],[-42,1,-9,1],[-40,1,-7,1]],"player":{"x":-37.89373688926882,"y":1,"z":-8.22511056244762,"yaw":4.752053906249995,"pitch":0.49198632812499876,"flying":false,"selected":0}}}
```

**This is how the world data looks like in version 4:**


```json
{"version":4,"id":"a","name":"A","createdAt":1789743100810,"updatedAt":1789743342616,"state":{"seed":3111309898,"edits":[[-41,1,-13,1],[-41,1,-12,1],[-41,2,-12,1],[-42,1,-12,1],[-42,1,-11,1],[-42,1,-10,1],[-42,1,-9,1],[-40,1,-7,1]],"player":{"x":-37.89373688926882,"y":1,"z":-8.22511056244762,"yaw":4.752053906249995,"pitch":0.49198632812499876,"flying":false,"selected":0}}}
```