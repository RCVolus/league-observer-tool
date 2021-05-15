<script lang="ts">
  const { ipcRenderer } = window.require("electron");
  import { LCU } from "./stores/LCU"; 
  import { Alert } from "./stores/Alert";
  import { Button, Alert as SSAlert } from "sveltestrap";
  import User from "./components/User.svelte";

  const {isConnected, summoner} = LCU

  //$summoner = JSON.parse('{"accountId":208440443,"displayName":"Himyu","internalName":"Himyu","nameChangeFlag":false,"percentCompleteForNextLevel":14,"profileIconId":4832,"puuid":"39e8cf98-7ffa-5641-a234-ef51693b888e","rerollPoints":{"currentPoints":323,"maxRolls":2,"numberOfRolls":1,"pointsCostToRoll":250,"pointsToReroll":177},"summonerId":53342871,"summonerLevel":123,"unnamed":false,"xpSinceLastLevel":527,"xpUntilNextLevel":3648}');

  ipcRenderer.on("console", (_event, args: any) => {
    console.log(args);
  });
</script>

{#if $summoner}
  <User />
{/if}

<main>  
  <SSAlert
    color={$Alert.color}
    isOpen={$Alert.show}
    toggle={() => ($Alert.show = false)}
  >
    <h4 class="alert-heading text-capitalize">{$Alert.heading}</h4>
    {$Alert.text}
  </SSAlert>
  
  {#if !$isConnected || !$summoner}
    <Button color="success" block size="lg" on:click={() => LCU.connect()}>
      connect
    </Button>
  {/if}
</main>

<style>
  main {
    width: 100%;
    flex-grow: 1;
    padding: 0 1rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
