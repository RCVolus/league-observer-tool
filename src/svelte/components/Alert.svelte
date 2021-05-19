<script lang="ts">
  import { Alert as SSAlert  } from "sveltestrap";
  import { Alert } from "../stores/Alert";
  import type { DisplayError } from "../../../types/DisplayError";

  import { onDestroy } from "svelte";
  let visible: boolean;
  let timeout: ReturnType<typeof setTimeout>;
  const onMessageChange = (alert: DisplayError) => {
    clearTimeout(timeout);
    if (!alert.show) {
      visible = false;
    } else {
      visible = true;
      const ms = alert.timeout || 3000
      if (ms > 0) timeout = setTimeout(() => (visible = false), ms);
    }
  };
  $: onMessageChange($Alert);
  onDestroy(() => clearTimeout(timeout));
</script>

<SSAlert
  color={$Alert.color}
  isOpen={visible}
  class="my-0"
>
  <h2 class="alert-heading text-capitalize">{$Alert.heading}</h2>
  {$Alert.text}
</SSAlert>