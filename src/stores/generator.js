import { defineStore } from 'pinia'

export const useGeneratorStore = defineStore('generator', {
    state: () => {
        return {
            url: "",
            key: "",
            prompt: "a tiger",
            size: "1024x1024"
        }
    },
    actions: {
       
    },
}, {
    persist: true
})
