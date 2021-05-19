<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import { LCU } from "./stores/LCU"; 
  import { Alert } from "./stores/Alert";
  import { Button, Alert as SSAlert, Spinner  } from "sveltestrap";
  import User from "./components/User.svelte";

  const {isConnected, summoner, isPending} = LCU

  ipcRenderer.on("console", (_event, args: any) => {
    console.log(args);
  });
</script>

{#if $summoner}
  <User />
{/if}

<main>  
  <SSAlert
    color={$Alert.color}
    isOpen={$Alert.show}
    toggle={() => ($Alert.show = false)}
    class="mb-5"
  >
    <h4 class="alert-heading text-capitalize">{$Alert.heading}</h4>
    {$Alert.text}
  </SSAlert>

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
