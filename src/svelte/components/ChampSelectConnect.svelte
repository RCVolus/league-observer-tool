<script lang="ts">
  import { Button, Card, CardBody, CardHeader } from "sveltestrap";
  const { ipcRenderer } = window.require("electron");

  let champselectSync = false

  function syncChampselect () {
    if (!champselectSync) {
      ipcRenderer.send('lcu-champ-select-start')
    } else {
      ipcRenderer.send('lcu-champ-select-stop')
    }
  }

  ipcRenderer.on('lcu-champ-select', (_e, connstate: boolean) => {
    champselectSync = connstate
  })
</script>

<Card class="my-2" inverse style="background: #0f2027">
  <CardHeader class="d-flex justify-content-between align-items-center">
    <b>Champselect</b>
    <small class={`ml-auto ${champselectSync ? 'text-success' : 'text-danger'}`}>{champselectSync ? 'Sync' : 'offline'}</small>
  </CardHeader>
  <CardBody>
    <Button block class="w-100" color={champselectSync ? 'success' : 'secondary'} on:click={syncChampselect}>Sync</Button>
  </CardBody>
</Card>