<script lang="ts">
  import { LCUCredentials } from "./stores/LCU";
  import { Alert } from "./stores/Alert";
  import { onDestroy } from "svelte";
  import type { DisplayError } from "../../types/DisplayError";
  import { Button, Alert as SSAlert } from "sveltestrap";

  let isLcuConnectetd: boolean;
  const unLCU = LCUCredentials.subscribe((v) => (isLcuConnectetd = v));
  let alert: DisplayError;
  const unAlert = Alert.subscribe((v) => (alert = v));
  onDestroy(() => {
    unLCU;
    unAlert;
  });
</script>

<main>
  {#if alert.show}
    <SSAlert
      class="w-100"
      color={alert.color}
      isOpen={alert.show}
      toggle={() => (alert.show = false)}
    >
      <h4 class="alert-heading text-capitalize">{alert.heading}</h4>
      {alert.text}
    </SSAlert>
  {/if}
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
    padding: 3rem;
    margin: 0 auto;
    background: #202020;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
