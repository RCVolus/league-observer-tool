<script lang="ts">
  import { Alert as SAlert } from "sveltestrap";
  import { AlertStore } from "../stores/Alert";
  import { ConnectionStore } from "../stores/Connector"; 
  import type { DisplayError } from "../../../types/DisplayError";
  import { onDestroy } from "svelte";

  const { Alert } = AlertStore
  const { lcuConnected, serverConnected, isConnected } = ConnectionStore

  let visible: boolean;
  let style = ""
  let timeout: ReturnType<typeof setTimeout>;
  const onMessageChange = (alert: DisplayError | null) => {
    if (!alert) return
    clearTimeout(timeout);
    visible = true;
    const ms = alert.timeout || 3000
    if (ms > 0) timeout = setTimeout(() => (visible = false), ms);
  };
  $: onMessageChange($Alert);
  onDestroy(() => clearTimeout(timeout));
</script>

<div class="alert-box">
  {#if !$isConnected}
    <SAlert
      color="danger"
      class="my-0 text-center"
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
    </SAlert>
  {/if}

  {#if $Alert}
  <SAlert
    color={$Alert.color}
    isOpen={visible}
    class="my-0 text-center"
    {style}
  >
    <h5 class="alert-heading text-capitalize mb-0">{$Alert.text}</h5>
  </SAlert>
  {/if}
</div>

<style>
  .alert-box {
    position: absolute;
    width: 100%;
    top: 0;
    z-index: 100;
  }
</style>