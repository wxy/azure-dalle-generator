// import "./style.css"
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

import App from './App.vue'

const app = createApp(App)

const pinia = createPinia();
pinia.use(createPersistedState({
    auto:true
}))
app.use(pinia)

app.mount('#app')
