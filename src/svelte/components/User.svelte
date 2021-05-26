<script lang="ts">
  import { Navbar, NavbarBrand, Button, Icon, Tooltip } from "sveltestrap";
  import { ConnectionStore } from "../stores/Connector";

  const gameVersion = "11.11.1"
  const { summoner } = ConnectionStore
  const iconId = $summoner?.profileIconId || "588"
  const src = `http://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${iconId}.png`

  function disconnect () {
    ConnectionStore.disconnect();
  }
</script>

<Navbar dark expand="md" color="secondary" class="py-2 px-3">
  <div class="navbar-brand">
    <img src={src} width="30" height="30" class="d-inline-flex align-top rounded-circle mr-5" alt={`${$summoner?.displayName || "Test"} summoner-icon`}>
    <span>{$summoner?.displayName || "Test"}</span>
  </div>
  <Button id="logout-btn" outline size="sm" on:click={disconnect}><Icon name="power" /></Button>
  <Tooltip target="logout-btn" placement="bottom">Disconnect</Tooltip>
</Navbar>