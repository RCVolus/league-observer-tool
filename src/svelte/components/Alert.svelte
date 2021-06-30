<script lang="ts">
  import { Alert as SSAlert  } from "sveltestrap";
  import { AlertStore } from "../stores/Alert";
  import { ConnectionStore } from "../stores/Connector"; 
  import type { DisplayError } from "../../../types/DisplayError";
  import { onDestroy } from "svelte";

  const { Alert } = AlertStore
  const { lcuConnected, serverConnected, isConnected } = ConnectionStore

  let visible: boolean;
  let style = ""
  let timeout: ReturnType<typeof setTimeout>;
  const onMessageChange = (alert: DisplayError) => {
    if (!alert) return
    clearTimeout(timeout);
    visible = true;
    const ms = alert.timeout || 3000
    if (ms > 0) timeout = setTimeout(() => (visible = false), ms);

    if (alert.color == "danger") {
      style = "background: rgb(185,72,109)"
    } else if (alert.color == "success") {
      style = "background: rgb(0,184,132)"
    }
  };
  $: onMessageChange($Alert);
  onDestroy(() => clearTimeout(timeout));
</script>

<div class="alert-box">
  {#if !$isConnected}
    <SSAlert
      color="danger"
      class="my-0 text-center"
      style="background: rgb(185,72,109)"
    >
      <h5 class="alert-heading text-capitalize mb-0">
        Not connected to
        {#if !$lcuConnected}
          LCU
        {/if}
        {#if !$lcuConnected && !$serverConnected}
          &
        {/if}
        {#if !$serverConnected}
          Server
        {/if}
      </h5>
    </SSAlert>
  {/if}

  {#if $Alert}
  <SSAlert
    color={$Alert.color}
    isOpen={visible}
    class="my-0 text-center"
    {style}
  >
    <h5 class="alert-heading text-capitalize mb-0">{$Alert.text}</h5>
  </SSAlert>
  {/if}
</div>

<style>
  .alert-box {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 100;
  }
</style>