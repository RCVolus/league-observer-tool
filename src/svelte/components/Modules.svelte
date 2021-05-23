<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import Module from "./Module.svelte";
  import { ConnectionStore } from "../stores/Connector"; 
  const modules : Map<string, string> = new Map()

  ipcRenderer.on('module-ready', (_e, {id, name}) => {
    modules.set(id, name)
  })
</script>

{#if ConnectionStore.isConnected}
  {#if modules}
    <div class="my-2">
      {#each [...modules] as [id, name]}
        <Module {id} {name} />
      {/each}
    </div>
  {/if}
{/if}