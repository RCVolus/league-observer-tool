<script lang="ts">
  import { Button, Card, CardBody, CardHeader, /* Icon */ } from "sveltestrap";
  import { availableModules } from "../stores/Stores";
  import { ConnectionStore } from "../stores/Connector"; 

  const {isConnected, isPending} = ConnectionStore

  export let id : string
  export let name : string
  export let actions : [string, string][]
  export let status = $availableModules.get(id)?.status || 0

  function sync () {
    if (status === 0) {
      window.modules.start(id)
    } else {
      window.modules.stop(id)
    }
  }

  /* function save () {
    window.modules.saveData(id)
  } */

  function callAction (action: string) {
    window.modules.callAction(id, action)
  }

  window.sender.on(`${id}`, (_e, connstate: 0 | 1 | 2) => {
    status = connstate[0]
    availableModules.update(m => {
      m.get(id)!.status = connstate[0]
      return m
    })
  })
</script>

<Card class={`my-3 ${status === 2 ? 'border-success' : status === 1 ? 'border-warning' : ''}`} color="dark">
  <CardHeader class="d-flex justify-content-between align-items-center">
    <small class={status === 2 ? 'text-success' : status === 1 ? 'text-warning' : 'text-danger'}>{status === 2 ? 'Sync' : status === 1 ? 'Standby' : 'Offline'}</small>
    <!-- <Button class="ml-auto" size="sm" color="dark" on:click={save} disabled={!$isConnected || $isPending}>
      <Icon name="file-earmark-post-fill" />
    </Button> -->
  </CardHeader>
  <CardBody>
    <h3 class="mb-3 text-center">{name}</h3>
    <Button block class="w-100 mb-2" color={status === 2 ? 'success' : status === 1 ? 'warning' : 'primary'} on:click={sync} disabled={!$isConnected || $isPending}>Sync</Button>
    {#each actions as action}
      <Button block class="w-100 mb-2" color='secondary' on:click={() => {
        callAction(action[0])
      }} disabled={!$isConnected || $isPending}>{action[1]}</Button>
    {/each}
  </CardBody>
</Card>