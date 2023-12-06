<script setup>
import { useGeneratorStore } from "./stores/generator"
import axios from "axios"
const store = useGeneratorStore();
import { ref } from 'vue'

const image = ref("https://generated.vusercontent.net/placeholder.svg");
const alt = ref("A caption for the above image.");
async function generate() {
    let response = await axios({
        "method": "POST",
        "url": store.url,
        "params": {
            "api-version": "2023-12-01-preview"
        },
        "headers": {
            "api-key": store.key,
            "Authorization": `Bearer ${store.key}`,
            "Content-Type": "application/json; charset=utf-8"
        },
        "data": {
            "size": store.size,
            "prompt": store.prompt
        }
    })
    image.value = response.data.data[0].url;
    alt.value = response.data.data[0].revised_prompt;
}
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">配置生成图片</h5>
                        <div class="mb-3">
                            <label class="form-label">API Endpoint</label>
                            <input type="text" v-model="store.url" class="form-control" placeholder="API Endpoint">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">API Key</label>
                            <input type="text" v-model="store.key" class="form-control" placeholder="API Endpoint">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片尺寸</label>
                            <select v-model="store.size" class="form-select" aria-label="Default select example">
                                <option selected>选择尺寸</option>
                                <option value="256x256">256x256</option>
                                <option value="1024x1024">1024x1024</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Prompt</label>
                            <textarea class="form-control" v-model="store.prompt" rows="5"></textarea>
                        </div>
                        <button class="btn btn-primary" @click="generate">生成图片</button>
                    </div>
                </div>
            </div>
            <div class="col">
                <figure class="figure">
                    <img :src="image" class="figure-img img-thumbnail" alt="...">
                    <figcaption class="figure-caption">{{alt}}</figcaption>
                </figure>
            </div>

        </div>

    </div>
</template>

