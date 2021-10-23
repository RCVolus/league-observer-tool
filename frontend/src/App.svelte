<script lang="ts">
  import Alert from "./components/Alert.svelte";
  import Client from "./components/Client.svelte";
  import Navigation from "./components/nav/Navigation.svelte";
  import { currentPage, availableModules } from "./stores/Stores"; 
  import { onMount } from 'svelte';
  import Game from "./components/Game.svelte";

  window.sender.on("console", (_event, ...args: any) => {
    console.log(...args);
  });

  onMount(async () => {
    const res = await window.modules.getModules()

    if (res) {
      res.forEach(resModul => {
        if ($availableModules.get(resModul.id)) return
        
        availableModules.set($availableModules.set(resModul.id, {
          id: resModul.id,
          name: resModul.name,
          actions: resModul.actions,
          status: resModul.status
        }))
      })
    }
  })
</script>

<Alert />

<main>
  {#if $currentPage == "client"}
    <Client />
  {:else if $currentPage == "in-game"}
    <Game />
  {/if}
</main>

<Navigation></Navigation>

<style>
  main {
    width: 100%;
    margin-bottom: 75px;
    height: calc(100vh - 75px);
    overflow: auto;
    display: flex;
    align-items: center;
  }
</style>
