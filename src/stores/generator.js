import { defineStore } from 'pinia'

export const useGeneratorStore = defineStore('generator', {
    state: () => {
        return {
            url: "",
            key: "",
            size: "1024x1024",
            style: "vivid",
            quality: "standard",
            design: "",
            selectedTags: [],
            background: -1,
            count: 0,
        }
    },
    actions: {
       
    },
}, {
    persist: true
})
