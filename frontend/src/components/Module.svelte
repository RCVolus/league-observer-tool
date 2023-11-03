<script lang="ts">
  import { Button, Card, CardBody, CardHeader, Form, Input } from "sveltestrap";
  import { availableModules } from "../stores/Stores";
  import { ConnectionStore } from "../stores/Connector";
  import type { Action } from "../../../types/Action";

  const { isConnected, isPending } = ConnectionStore;

  export let id: string;
  export let name: string;
  export let actions: [string, Action][];
  export let status = $availableModules.get(id)?.status || 0;

  function sync() {
    if (status === 0) {
      window.modules.start(id);
    } else {
      window.modules.stop(id);
    }
  }

  /* function save () {
    window.modules.saveData(id)
  } */

  function callAction(action: string, value?: string | number) {
    window.modules.callAction(id, action, value);
  }

  window.sender.on(`${id}`, (_e, connState: Array<0 | 1 | 2>) => {
    status = connState[0];
    availableModules.update((m) => {
      m.get(id)!.status = connState[0];
      return m;
    });
  });
</script>

<Card
  class={`my-3 ${
    status === 2 ? "border-success" : status === 1 ? "border-warning" : ""
  }`}
  color="dark"
>
  <CardHeader>
    <small
      class={status === 2
        ? "text-success"
        : status === 1
        ? "text-warning"
        : "text-danger"}
      >{status === 2 ? "Sync" : status === 1 ? "Standby" : "Offline"}</small
    >
  </CardHeader>
  <CardBody>
    <h3 class="mb-3 text-center">{name}</h3>
    <Button
      block
      class="w-100 mb-2"
      color={status === 2 ? "success" : status === 1 ? "warning" : "secondary"}
      on:click={sync}
      disabled={!$isConnected || $isPending}>Sync</Button
    >
    {#each actions as [action, opt]}
      {#if opt.type === "button"}
        <Button
          block
          class="w-100 mb-2"
          color="secondary"
          on:click={() => {
            callAction(action);
          }}
          disabled={!$isConnected || $isPending}>{opt.title}</Button
        >
      {:else if opt.type === "input"}
        <Form
          on:submit={(e) => {
            if (!(new RegExp(opt.input.pattern).test(opt.input.default))) return
            e.preventDefault();
            callAction(action, opt.input.default);
          }}
        >
          <div class="d-flex w-100 mb-2">
            <Button
              type="submit"
              style="flex-grow: 1"
              color="secondary"
              disabled={!$isConnected || $isPending}>{opt.title}</Button
            >

            {#if opt.input.type === "text"}
              <Input
                style="width: 20%"
                bind:value={opt.input.default}
                type={opt.input.type}
                invalid={opt.input.pattern !== undefined
                  ? !(new RegExp(opt.input.pattern).test(opt.input.default))
                  : undefined}
                required
                disabled={!$isConnected || $isPending}
              />
            {:else}
              <Input
                style="width: 20%"
                bind:value={opt.input.default}
                type={opt.input.type}
                required
                disabled={!$isConnected || $isPending}
              />
            {/if}
          </div>
        </Form>
      {/if}
    {/each}
  </CardBody>
</Card>
