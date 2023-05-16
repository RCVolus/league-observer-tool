<script lang="ts">
  import NavConnect from "./NavConnect.svelte";
  import NavItem from "./NavItem.svelte";
</script>

<div class="navbar">
  <ul class="items">
    <NavItem icon="window" name="Client" href="client" />
    <NavItem icon="controller" name="In Game" href="in-game" />
    <NavItem type="timer" />
    <NavItem icon="gear" name="Settings" href="settings" width={2} />
  </ul>
  <NavConnect />
</div>

<style>
  .navbar {
    padding: 0;
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    height: 75px;
    background: #212121;
    -webkit-box-shadow: 0px -5px 10px 0px rgba(0,0,0,0.25); 
    box-shadow: 0px -5px 10px 0px rgba(0,0,0,0.25);
  }

  .items {
    width: 100%;
    height: 100%;
    display: flex;
    list-style: none;
    padding: 0;
    margin-bottom: 0;
  }
</style>