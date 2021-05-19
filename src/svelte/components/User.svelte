<script lang="ts">
  import { Navbar, NavbarBrand, Button, Icon, Tooltip } from "sveltestrap";
  import { LCU } from "../stores/LCU";

  const gameVersion = "11.10.1"
  const { summoner } = LCU
  const iconId = $summoner?.profileIconId || "404"
  const src = `http://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${iconId}.png`

  function disconnect () {
    LCU.disconnect();
  }
</script>

<Navbar dark expand="md" class="p-2">
  <NavbarBrand>
    <img src={src} width="30" height="30" class="d-inline-block align-top mr-2" alt="">
    {$summoner?.displayName || ""}
  </NavbarBrand>
  <Button color="light" id="logout-btn" outline size="sm" on:click={disconnect}><Icon name="power" /></Button>
  <Tooltip target="logout-btn" placement="bottom">Disconnect</Tooltip>
</Navbar>