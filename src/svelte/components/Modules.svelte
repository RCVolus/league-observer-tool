<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import { onMount } from 'svelte';
  import Module from "./Module.svelte";
  let modules : Array<{
      id: string
      name: string,
      actions: [string, string][]
  }> = []

  onMount(async () => {
    const res = await ipcRenderer.sendSync('modules-ready') as Array<{
      id: string
      name: string,
      actions: [string, string][]
    }>

    if (res) {
      res.forEach(resModul => {
        if (!modules.find(m => m.id == resModul.name)) {
          modules = [...modules, {
            id: resModul.id,
            name: resModul.name,
            actions: resModul.actions
          }]
        }
      })
    }
  })
</script>

<div class="my-4">
  {#each modules as {id, name, actions}}
    <Module {id} {name} {actions} />
  {/each}
</div>