<script lang="ts">
  import type { Summoner } from "../../../types/Summoner/Summoner";
  import { ConnectionStore } from "../stores/Connector";

  const gameVersion = "11.16.1"
  const { summoner } = ConnectionStore
  let iconId = $summoner?.profileIconId || 588

  function changeIconId(newSummoner : Summoner | undefined) {
    iconId = newSummoner?.profileIconId || 588
  }
  $: changeIconId($summoner)
</script>

<div class="profile w-100">
  {#if $summoner}
    <h5 class="mb-4 text-muted">Logged in as:</h5>
    <img src="http://ddragon.leagueoflegends.com/cdn/{gameVersion}/img/profileicon/{iconId}.png" width="150" height="150" class="mb-3 rounded-circle" alt={`${$summoner?.displayName || "Test"} summoner-icon`}>
    <div class="summonerInfo">
      <h1 class="name">{$summoner?.displayName || "Test"}</h1>
      <p class="text-muted">Level: {$summoner?.summonerLevel || ""}</p>
    </div>
  {:else}
    <h5 class="mb-4 text-muted">Not logged in yet</h5>
  {/if}
</div>

<style>
  .profile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .summonerInfo {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    text-align: center;
  }

  p {
    margin-bottom: 0;
  }

  .rounded-circle {
    object-fit: cover;
    object-position: center;
  }
</style>