<script lang="ts">
  import Fa from "svelte-fa";
  import { faWarning, faClose } from "@fortawesome/free-solid-svg-icons";
  import { onMount, onDestroy } from "svelte";
  import type { DisplayError } from "../../../types/DisplayError";
  import { alert as alertStore } from '$lib/store'

  onMount(async () => {
    window.sender.on('error', (_e: any, error : DisplayError[]) => {
      alert = error[0]
    })
  });

  let alert: DisplayError

  let title = "Title";
  let message = "Message";

  let timeout: ReturnType<typeof setTimeout>;
  let color: DisplayError["color"];
  let visible: boolean = false;

  const onMessageChange = (alert: DisplayError | null) => {
      if (!alert) return;

      clearTimeout(timeout);
      const ms = alert.timeout ?? 3000;

      visible = true;
      color = alert.color
      title = alert.title
      message = alert.message
      
      if (ms > 0) timeout = setTimeout(() => (visible = false), ms);
    };
  $: onMessageChange(alert);
  $: onMessageChange($alertStore);

  onDestroy(() => clearTimeout(timeout));
</script>

{#if visible}
  <aside class="alert variant-filled-{color}">
    <!-- Icon -->
    <div>
      <Fa icon={faWarning} size="1.5x" />
    </div>
    <!-- Message -->
    <div class="alert-message">
      <h3 class="h3">{title}</h3>
      <p>{message}</p>
    </div>
    <!-- Actions -->
    <div class="alert-actions">
      <button
        type="button"
        class="btn-sm btn-icon variant-filled"
        on:click={() => (visible = !visible)}
      >
        <Fa icon={faClose} />
      </button>
    </div>
  </aside>
{/if}
