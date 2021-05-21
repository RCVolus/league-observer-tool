<script lang="ts">
  import { Alert as SSAlert  } from "sveltestrap";
  import { AlertStore } from "../stores/Alert";
  import type { DisplayError } from "../../../types/DisplayError";
  import { onDestroy } from "svelte";

  const { Alert } = AlertStore

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

{#if $Alert}
<SSAlert
  color={$Alert.color}
  isOpen={visible}
  class="my-0 text-center"
>
  <h5 class="alert-heading text-capitalize mb-0">{$Alert.text}</h5>
</SSAlert>
{/if}