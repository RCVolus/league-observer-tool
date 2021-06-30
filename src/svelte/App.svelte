<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import Alert from "./components/Alert.svelte";
  import Client from "./components/Client.svelte";
  import Navigation from "./components/nav/Navigation.svelte";
  import { currentPage, availableModules } from "./stores/Stores"; 
  import { onMount } from 'svelte';
  import Game from "./components/Game.svelte";
  import Profile from "./components/Profile.svelte";

  ipcRenderer.on("console", (_event, ...args: any) => {
    console.log(...args);
  });

  onMount(async () => {
    const res = await ipcRenderer.sendSync('modules-ready') as Array<{
      id: string
      name: string,
      actions: [string, string][]
    }>

    if (res) {
      res.forEach(resModul => {
        if ($availableModules.find(m => m.id == resModul.name)) return
        
        availableModules.set([...$availableModules, {
          id: resModul.id,
          name: resModul.name,
          actions: resModul.actions
        }])
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
  {:else if $currentPage == "profile"}
    <Profile />
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
