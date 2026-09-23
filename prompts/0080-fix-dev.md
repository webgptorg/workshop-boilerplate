[-] !

The `npm run dev` command is failing

- 

```console
npm run dev

...


⨯ Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.
  [..., {id: 1, user_id: 3, text: ..., status: ..., response: ..., canteen_id: ..., name: ...}]
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    at ignore-listed frames {
  digest: '2436857726'
}
 GET / 500 in 51ms (next.js: 12ms, application-code: 39ms)
[browser] Uncaught Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.
  [..., {id: 1, user_id: 3, text: ..., status: ..., response: ..., canteen_id: ..., name: ...}]
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```