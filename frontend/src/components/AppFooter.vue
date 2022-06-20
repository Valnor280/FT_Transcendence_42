  <template>
    <footer @contextmenu="menuChat($event)" ref="footer">
        <div class="underChat"  v-for="tab in props.onglet">
          <!-- <div v-bind:style="[tab === 'General' ? {'margin-left' : '10%'}: {}]"> -->
            <button class="largeButton" @click="emit_click(tab)" v-bind:style="[tab === 'General' ? {}: {'color': '#daa520'}]" :class="[notRead && notRead.has(tab) ? 'notif' : '']">
            <img v-if="props.list_user && !props.list_user.has(tab)" class="imageRocket" :src="require(`../assets/grayrocket.png`)">
            <img v-else class="imageRocket" :src="tab === props.myName ?  require(`../assets/bluerocket.png`) : require(`../assets/rocket.png`)">
          <img src="../assets/rocketLeave.png" height="10px" width="10px">
            <strong>{{tab}}</strong>
            <img src="../assets/rocketLeave.png" class="imageRocketL leaveButton" v-if="tab !== 'General'" @click.stop @click="emitter('delete_c', tab)">
            </button>
          <!-- </div> -->
        </div>
    </footer>
  </template>
  
  <script setup lang="ts">
    import { ref, reactive, onMounted, onBeforeUpdate, onUpdated, watch, nextTick, defineProps} from 'vue'
    import $axios from '../plugin/axios';
    import $socket from '../plugin/socket';
    const emitter = defineEmits(['click_c', 'input_u', 'delete_c']);
    const props = defineProps({
        onglet: Set,
        notRead: Set,
        myName: String,
        list_user: Set,
    });
    const footer = ref();
    function emit_click(tab_name : any){
        emitter('click_c', tab_name);
    }
    async function menuChat(key : any){
      key.preventDefault();
      await nextTick();
      emitter('input_u', true, key.y , key.x, null, null, {imadmin : false, hesadmin : false});
    }
  </script>
  
<style scoped src="../../css/AppFooterStyle.css">
  </style>