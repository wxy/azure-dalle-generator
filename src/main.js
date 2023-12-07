// import "./style.css"
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import VueClipboard from 'vue3-clipboard'
import App from './App.vue'

const app = createApp(App)

const pinia = createPinia();
pinia.use(createPersistedState({
    auto: true
}))
app.use(pinia)
app.use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true,
})

app.mount('#app')
