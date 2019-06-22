# svelte-gql

> A lightweight and simple GraphQL client for [Svelte](https://svelte.dev/) 🔥

### Definitely a WIP, but it works!

Just discovered someone already uses the name [svql](https://github.com/pateketrueke/svql) 😢

This started as a attempt to port the [graphql-hooks](https://github.com/nearform/graphql-hooks) library to svelte. A lot of ideas and code borrowed from that library but simplified.

## Example using Sapper

```js
<script context="module">
  import { createClient, executeQuery } from "svelte-gql";

  const client = createClient({
    url: process.env.GRAPHQL_ENDPOINT,
    headers: {
      "x-hasura-admin-secret": process.env.HASURA_ACCESS_KEY
    }
  });

  const user = executeQuery();

  export async function preload() {
    return { user };
  }
</script>

<script>
  import { setContext } from "svelte";

  setContext("client", client);

  const user_query = /* GraphQL */ `
    query {
      user {
        name
      }
    }
  `

  user.query(client, { query: user_query });
</script>

<div>
  {#if $user.fetching}
    <div>loading...</div>
  {/if}
  {#if $user.data}
    {#each $user.data.user as user}
      <h1>{user.name}</h1>
    {/each}
  {/if}
</div>
```

## TODO

- Add mutations
- Add methods to clear/invalidate cache
- See if there's a way to use Svelte's context api instead of passing client instance to `query` function
- Decide if I should use Graphql's Document AST and normalize data
- Since the name svql is taken, decide on another name. For now it's just svelte-gql
- Test, Test, Test
