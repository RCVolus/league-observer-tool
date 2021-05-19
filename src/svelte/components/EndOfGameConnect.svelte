<script lang="ts">
  import { Button, Card, CardBody, CardHeader } from "sveltestrap";
  const { ipcRenderer } = window.require("electron");

  let endGameSync = false

  function syncEndGame () {
    if (!endGameSync) {
      ipcRenderer.send('lcu-end-of-game-start')
    } else {
      ipcRenderer.send('lcu-end-of-game-stop')
    }
  }

  ipcRenderer.on('lcu-end-of-game', (_e, connstate: boolean) => {
    endGameSync = connstate
  })
</script>

<Card class="my-2" inverse style="background: #0f2027">
  <CardHeader class="d-flex justify-content-between align-items-center">
    <b>End of Game</b>
    <small class={`ml-auto ${endGameSync ? 'text-success' : 'text-danger'}`}>{endGameSync ? 'Sync' : 'offline'}</small>
  </CardHeader>
  <CardBody>
    <Button block class="w-100" color={endGameSync ? 'success' : 'secondary'} on:click={syncEndGame}>Sync</Button>
  </CardBody>
</Card>