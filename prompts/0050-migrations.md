[ ]

Create a system for migrations.

- Migrations should be applied on the localstorage.
- When there are multiple migrations which need to be applied, apply them one by one.
- Create a system for these migrations, Each migration should be a Typescript function, which transforms the old version to new version in folder `migrations`.
- The migrations should work per-world. Migration should be applied only when it's needed.
- Always preserve last migration state here, the garbage collecting will be implemented later.
- You are now creating both the migration from version 3 to version 4 and system for these migrations which will be used in all future version upgrades.
- There should be an up-migrate and down-migrate file for each migration.
    - Up migrations are the important ones that transform the old version to the new version and are applied when upgrading durng runtime
    - Down migrations are fow now used only to unit test the rollback of migrations but never applied during normal runtime
- There should be types for all the world versions, for example `world_data_json_v3`
- Now there is a version of the world v3, We want to do v4 and implement system of migrations.


**This is how the world data looks like in version 3:**

```json
{"id":"a","name":"A","createdAt":1789743100810,"updatedAt":1789743342616,"state":{"version":3,"seed":3111309898,"edits":[[-41,1,-13,1],[-41,1,-12,1],[-41,2,-12,1],[-42,1,-12,1],[-42,1,-11,1],[-42,1,-10,1],[-42,1,-9,1],[-40,1,-7,1]],"player":{"x":-37.89373688926882,"y":1,"z":-8.22511056244762,"yaw":4.752053906249995,"pitch":0.49198632812499876,"flying":false,"selected":0}}}
```

**This is how the world data looks like in version 4:**


```json
{"version":4,"id":"a","name":"A","createdAt":1789743100810,"updatedAt":1789743342616,"state":{"seed":3111309898,"edits":[[-41,1,-13,1],[-41,1,-12,1],[-41,2,-12,1],[-42,1,-12,1],[-42,1,-11,1],[-42,1,-10,1],[-42,1,-9,1],[-40,1,-7,1]],"player":{"x":-37.89373688926882,"y":1,"z":-8.22511056244762,"yaw":4.752053906249995,"pitch":0.49198632812499876,"flying":false,"selected":0}}}
```

**This is how the migration folder, files should look like:**

```ts
// /migrations/00040/world-data.ts


export type world_data_json_v4 = {
    version: 4;
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    state: {
       // ...
    };
} as const;
```

```ts
// /migrations/00040/up-migrate.ts

import type { world_data_json_v3 } from '../00030/world-data';
import type { world_data_json_v4 } from './world-data';

export default function migrateFromV3ToV4(value: world_data_json_v3): world_data_json_v4 {
    // ...
}
```


```ts
// /migrations/00040/down-migrate.ts

import type { world_data_json_v3 } from '../00030/world-data';
import type { world_data_json_v4 } from './world-data';

export default function migrateFromV4ToV3(value: world_data_json_v4): world_data_json_v3 {
    // ...
}
```