<script lang="ts">
  import { availableModules } from "../stores/Stores"; 
  import Module from "./Module.svelte";
</script>

<div class="my-auto p-3 w-100">
  {#each Array.from($availableModules) as [_id, module]}
    {#if module.id.startsWith('lcu')}
      <Module {...module} />
    {/if}
  {/each}
</div>