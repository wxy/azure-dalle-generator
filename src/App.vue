<script setup>
import { useGeneratorStore } from "./stores/generator"
import axios from "axios"
const store = useGeneratorStore();
import { ref } from 'vue'

const image = ref("https://generated.vusercontent.net/placeholder.svg");
const alt = ref("A caption for the above image.");
const session = ref("");
const prompt = ref("a tiger")
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
            "prompt": prompt.value,
            "quality": store.quality,
            "style":store.style
        }
    })
    image.value = response.data.data[0].url;
    session.value = image.value.substr(image.value.indexOf('/images/') + 8,36);
    alt.value = response.data.data[0].revised_prompt;
    store.count++;
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
                                <option value="1024x1024">1024x1024</option>
                                <option value="1024x1792">1024x1792</option>
                                <option value="1792x1024">1792x1024</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片风格</label>
                            <select v-model="store.style" class="form-select" aria-label="Default select example">
                                <option selected>选择风格</option>
                                <option value="natural">natural</option>
                                <option value="vivid">vivid</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片质量</label>
                            <select v-model="store.quality" class="form-select" aria-label="Default select example">
                                <option selected>选择图片质量</option>
                                <option value="standard">standard</option>
                                <option value="hd">hd</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">提示词</label>
                            <textarea class="form-control" v-model="prompt" rows="5"></textarea>
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
                <div class="mb-3">
                    <label class="form-label">已生成 {{ store.count }} 张图片</label>
                </div>
                <div class="mb-3">
                    <label class="form-label">会话 ID</label>
                    <input type="text" :value="session" class="form-control" placeholder="">
                </div>
            </div>

        </div>

    </div>
</template>

