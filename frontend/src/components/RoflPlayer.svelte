<script lang="ts">
  import { Button } from 'sveltestrap';
  import { AlertStore } from "../stores/Alert";

  const { Alert } = AlertStore
  let path = ''

  async function findAndStart() {
    path = await window.rofl.findAndStart()
  }
</script>

<div class="my-auto mx-auto p-3 text-center">
  {#if path === ''}
    <h3>Select a File</h3>
  {:else}
    <h3>Starting File</h3>
    <p>{path}</p>
  {/if}

  <Button on:click={findAndStart}>Chose a ROFL-File</Button>
</div>