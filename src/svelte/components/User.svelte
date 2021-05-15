<script lang="ts">
  import { Navbar, NavbarBrand, Button, Icon, Tooltip, Modal, ModalHeader, ModalBody, ModalFooter } from "sveltestrap";
  import { LCU } from "../stores/LCU"; 

  const gameVersion = "11.10.1"
  const { summoner } = LCU
  const iconId = $summoner?.profileIconId || "404"
  const src = `http://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${iconId}.png`

  let open = false;
  const toggle = () => (open = !open);

  function disconnect () {
    LCU.isConnected.set(false)
    LCU.disconnect();
    toggle();
  }
</script>

<Modal isOpen={open} {toggle} class="my-auto">
  <ModalHeader {toggle}>Disconnect LCU?</ModalHeader>
  <ModalBody>
    Are you sure you want to disconnect your LCU connection?
  </ModalBody>
  <ModalFooter>
    <Button color="danger" on:click={disconnect}>Disconnect</Button>
    <Button color="secondary" on:click={toggle}>Cancel</Button>
  </ModalFooter>
</Modal>

<Navbar dark expand="md" class="p-2">
  <NavbarBrand>
    <img src={src} width="30" height="30" class="d-inline-block align-top mr-2" alt="">
    {$summoner?.displayName || ""}
  </NavbarBrand>
  <Button color="light" id="logout-btn" outline size="sm" on:click={() => open = true}><Icon name="power" /></Button>
  <Tooltip target="logout-btn" placement="bottom">Logout</Tooltip>
</Navbar>