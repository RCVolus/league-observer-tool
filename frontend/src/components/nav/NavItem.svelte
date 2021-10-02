<script lang="ts">
  import { Icon } from "sveltestrap"
  import { currentPage } from "../../stores/Stores"; 
  const { ipcRenderer } = require('electron')

  export let icon : string = ""
  export let name : string = ""
  export let href : string = ""
  export let type : "link" | "timer" = "link"
  let timer = "-- : -- : --"

  let active = $currentPage == href
  function checkActiv (page: string) {
    active = page == href
  }
  $: checkActiv($currentPage)

  function setPage () {
    currentPage.set(href)
  }

  if (type === "timer") {
    let offset = 0

    ipcRenderer.on('server-prod-clock', (_e: any, newOffset : number) => {
      offset = newOffset
    })

    setInterval(() => {
      const time = new Date().getTime()
      const newTime = new Date(time + offset)
      timer = `${('0' + newTime.getHours()).slice(-2)} : ${('0' + newTime.getMinutes()).slice(-2)} : ${('0' + newTime.getSeconds()).slice(-2)}`
    }, 200)
  }
</script>

{#if type == "link"}
  <li class="navitem" class:active on:click={setPage}>
    <div class="icon">
      <Icon name={icon} />
    </div>
    <p class="name">{name}</p>
  </li>
{:else if type == "timer"}
  <li class="navitem timer">
    <p class="time">{timer}</p>
  </li>
{/if}

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .navitem {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 20%;
  }

  .time {
    margin-top: 1.53rem;
  }

  .navitem:hover .icon {
    color: #029ef7;
  }

  .icon {
    margin-top: -6px;
    font-size: 20px;
  }

  .name {
    margin-top: 3px;
    font-size: 12px;
  }

  .active {
    border-top: 2px solid rgb(2, 158, 247, 0.5);
    border-radius: 3px;
    box-shadow: 0px -10px 10px -10px rgba(2,158,247, 0.75);
    background: rgb(2,158,247);
    background: linear-gradient(180deg, rgba(2,158,247,0.15) 0%, rgba(2,158,247,0) 100%);
  }

  .active .icon {
    color: #029ef7;
  }
</style>