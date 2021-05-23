<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import { onMount } from 'svelte';
  import Module from "./Module.svelte";
  let modules : Array<{
      id: string
      name: string
  }> = []

  onMount(async () => {
    const res = await ipcRenderer.sendSync('modules-ready') as Array<{
      id: string
      name: string
    }>

    if (res) {
      res.forEach(resModul => {
        if (!modules.find(m => m.id == resModul.name)) {
          modules = [...modules, {id: resModul.id, name: resModul.name}]
        }
      })
    }
  })
</script>

<div class="my-2">
  {#each modules as {id, name}}
    <Module {id} {name} />
  {/each}
</div>