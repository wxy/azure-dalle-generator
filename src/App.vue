<script setup>
import { useGeneratorStore } from "./stores/generator"
import axios from "axios"
const store = useGeneratorStore();
import { ref } from 'vue'

const image = ref("https://generated.vusercontent.net/placeholder.svg");
const alt = ref("A caption for the above image.");
const session = ref("");
const prompt = ref("a tiger")

let loadingInterval = null;  // 将此间隔定义到外部，以便在 generate 函数内和外部访问。

async function generate() {
    // 清空figcaption的内容
    alt.value = "";
    // 启动定时器，每秒在 figcaption 后增加一个 '.'
    loadingInterval = setInterval(() => {
        alt.value += ".";
    }, 1000);

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
            "style": store.style
        }
    })
    // 清除定时器
    clearInterval(loadingInterval);

    image.value = response.data.data[0].url;
    session.value = image.value.substr(image.value.indexOf('/images/') + 8, 36);
    alt.value = response.data.data[0].revised_prompt;
    store.count++;
}
const onCopy = e => {
    alert("复制成功")
}
</script>

<template>
    <div class="container">
        <h1 class="my-4">Azure dalle-3 Generator</h1>
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
                    <img :src="image" style="width: 50%;" class="figure-img img-thumbnail" :alt="...">
                    <figcaption class="figure-caption">{{ alt }}</figcaption>
                </figure>
                <div class="card">
                    <div class="card-header">
                        操作
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">已生成图片总量:
                            <span class="badge bg-secondary"> {{ store.count }}</span>
                        </li>
                        <li class="list-group-item">会话 ID：<span class="badge bg-secondary"> {{ session ? session : "Azure 会话  ID，可用于回溯" }}</span></li>
                        <li class="list-group-item">操作：
                            <button type="button" v-clipboard:copy="session" v-clipboard:success="onCopy" class="btn btn-primary btn-sm me-2">复制会话 ID</button>
                            <button type="button" v-clipboard:copy="prompt"  v-clipboard:success="onCopy" class="btn btn-primary btn-sm me-2">复制原始提示词</button>
                            <button type="button" v-clipboard:copy="alt" v-clipboard:success="onCopy" class="btn btn-primary btn-sm">复制最终提示词</button>
                        </li>
                    </ul>
                </div>

            </div>

        </div>

    </div>
</template>

