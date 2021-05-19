<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import { LCU } from "./stores/LCU"; 
  import { Button, Spinner  } from "sveltestrap";
  import User from "./components/User.svelte";
  import Alert from "./components/Alert.svelte";
  import ChampSelectConnect from "./components/ChampSelectConnect.svelte";
import EndOfGameConnect from "./components/EndOfGameConnect.svelte";

  const {isConnected, summoner, isPending} = LCU

  ipcRenderer.on("console", (_event, args: any) => {
    console.log(args);
  });
</script>

<Alert />

{#if $summoner}
  <User />
{/if}

<main>
  {#if $isPending}
    <div class="text-center mb-5">
      <Spinner style="width: 3rem; height: 3rem;" color="primary" />
    </div>
  {/if}
  
  {#if !$isConnected || !$summoner}
    <Button color="success" block size="lg" on:click={() => LCU.connect()} disabled={$isPending}>
      connect
    </Button>
  {/if}

  {#if $isConnected}
    <ChampSelectConnect />
    <EndOfGameConnect />
  {/if}
</main>

<style>
  main {
    width: 100%;
    flex-grow: 1;
    padding: 0 1rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
