 <template>

    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
      class="side-bar"        
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
        </v-list-item-avatar>

        <v-list-item-title>My Compounds</v-list-item-title>

        <v-btn
          icon
          @click.stop="mini = !mini"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.id"
          url
        >
          <v-list-item-icon>
            <v-icon></v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>



 </template>
<script>
    // import DoseResponse from './DoseResponse';

    export default {
      name: 'SideBar',
      // components: {
      //   DoseResponse
      // },
      props: {

      },
      data () {
        return {
          drawer: true,
          items: [
            { title: 'Home', icon: 'mdi-home-city' },
            { title: 'My Account', icon: 'mdi-account' },
            { title: 'Users', icon: 'mdi-account-group-outline' },
          ],
          mini: true,
        }
      }

    }
  </script>
  <style>
    .side-bar{
      position:absolute;
      left:0px;
      top:0px;
    }
  </style>