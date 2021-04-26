<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import { LCUCredentials, Summoner } from "./stores/LCU";
  import { Alert } from "./stores/Alert";
  import { onDestroy } from "svelte";
  import type { DisplayError } from "../../types/DisplayError";
  import { Button, Alert as SSAlert } from "sveltestrap";
  import type { Summoner as SummonerType } from "../../types/Summoner/Summoner";

  let isLcuConnectetd: boolean;
  const unLCU = LCUCredentials.subscribe((v) => (isLcuConnectetd = v));
  let alert: DisplayError;
  const unAlert = Alert.subscribe((v) => (alert = v));

  let summoner: SummonerType;
  const unSummoner = Summoner.subscribe((v) => (summoner = v));
  $: haveClient = !!summoner;

  onDestroy(() => {
    unLCU;
    unAlert;
    unSummoner;
  });

  ipcRenderer.on("console", (_event, args: any) => {
    console.log(args);
  });
</script>

<main>
  {#if isLcuConnectetd && haveClient}
    <h5>Welcome</h5>
    <h1>{summoner.displayName}</h1>
  {/if}

  <SSAlert
    class="w-100"
    color={alert.color}
    isOpen={alert.show}
    toggle={() => (alert.show = false)}
  >
    <h4 class="alert-heading text-capitalize">{alert.heading}</h4>
    {alert.text}
  </SSAlert>
  <Button
    color={isLcuConnectetd ? "success" : "primary"}
    block
    on:click={() => {
      if (!isLcuConnectetd) {
        LCUCredentials.connect();
      } else {
        LCUCredentials.disconnect();
      }
    }}
  >
    {isLcuConnectetd ? "disconnect" : "connect"}
  </Button>
</main>

<style>
  main {
    height: 100vh;
    padding: 2rem;
    margin: 0 auto;
    background: #0f2027;
    background: -webkit-linear-gradient(-15deg, #0f2027, #203a43);
    background: linear-gradient(-15deg, #0f2027, #203a43);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
