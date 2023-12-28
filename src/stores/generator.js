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
            background: "",
            count: 0,
            theme: 'light',
        }
    },
    actions: {
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
        }
    },
}, {
    persist: true
})
