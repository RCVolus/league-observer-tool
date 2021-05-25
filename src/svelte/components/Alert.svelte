<script lang="ts">
  import { Alert as SSAlert  } from "sveltestrap";
  import { AlertStore } from "../stores/Alert";
  import { ConnectionStore } from "../stores/Connector"; 
  import type { DisplayError } from "../../../types/DisplayError";
  import { onDestroy } from "svelte";

  const { Alert } = AlertStore
  const { lcuConnected, serverConnected, isConnected } = ConnectionStore

  let visible: boolean;
  let timeout: ReturnType<typeof setTimeout>;
  const onMessageChange = (alert: DisplayError) => {
    if (!alert) return
    clearTimeout(timeout);
    visible = true;
    const ms = alert.timeout || 3000
    if (ms > 0) timeout = setTimeout(() => (visible = false), ms);
  };
  $: onMessageChange($Alert);
  onDestroy(() => clearTimeout(timeout));
</script>


{#if !$isConnected}
  <SSAlert
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
  </SSAlert>
{/if}

{#if $Alert}
<SSAlert
  color={$Alert.color}
  isOpen={visible}
  class="my-0 text-center"
>
  <h5 class="alert-heading text-capitalize mb-0">{$Alert.text}</h5>
</SSAlert>
{/if}