<template>
  <v-container>
    holis
    <v-btn @click="sendMessage">send</v-btn>
  </v-container>
</template>
<script>
import io from 'socket.io-client'
const socket = io('http://localhost:3000')

export default {
  created() {
    socket.on('new-message', (message) => {
      console.log('sdsd')
    })
  },
  methods: {
    sendMessage(){
      socket.emit('send-message',{msg:'holis'})
    }
  },
};
</script>
