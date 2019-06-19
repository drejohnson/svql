# svql

> A lightweight and simple GraphQL client for [Svelte](https://svelte.dev/) 🔥

### Definitely a WIP

Just discovered someone already uses the name [svql](https://github.com/pateketrueke/svql) 😢

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
