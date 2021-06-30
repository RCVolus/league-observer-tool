<script lang="ts">
  import { availableModules } from "../stores/Stores"; 
  import Module from "./Module.svelte";
</script>

<div class="my-auto p-3 w-100">
  {#each $availableModules as {id, name, actions}}
    {#if id.startsWith('lcu')}
      <Module {id} {name} {actions} />
    {/if}
  {/each}
</div>