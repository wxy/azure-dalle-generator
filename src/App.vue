<script setup>
import { useGeneratorStore } from "./stores/generator";
import axios from "axios";
const store = useGeneratorStore();
import { ref } from 'vue';

const image = ref("https://generated.vusercontent.net/placeholder.svg");
const alt = ref("A caption for the above image.");
const session = ref("");
const prompt = ref("Linux");

// 初始状态下，按钮显示的文字为'生成图片'
let buttonLabel = ref('生成图片');

let buttonInterval = null;  // 创建一个变量来存储计时器ID
let buttonDots = '';  // 创建一个变量来存储点

let loadingInterval = null;  // 定义一个变量来存储计时器ID
const loadingChars = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];  // 定义一组字符来展示滚动
let index = 0;  // 定义一个索引用来跟踪当前显示的字符
let progress = ""; // 定义一个字符串变量来储存进度点

async function generate() {
    buttonInterval = setInterval(() => {

        // 更新显示的'•'数量
        buttonDots += '•';
        if(buttonDots.length > 3){
            buttonDots = '';
        }

        // 更新按钮的显示
        buttonLabel.value = '生成图片' + buttonDots;
    }, 200);

    alt.value = "生成中 " + loadingChars[index];  // 初始化加载信息
    loadingInterval = setInterval(() => {
        index++;
        // 当完成一次完整的旋转后，我们添加一个 '•'
        if (index === loadingChars.length) {
            index = 0; // 重置旋转字符的索引
            progress += '•' // 添加进度点
        }

        // 使用进度点和当前的旋转字符更新显示的字符串
        alt.value = '生成中 ' + progress + ' ' + loadingChars[index];
    }, 200);


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
    clearInterval(buttonInterval);  // 当请求完成时清除计时器
    buttonLabel.value = '生成图片';  // 取消加载状态并恢复原文字
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
                        <button id="generateButton" class="btn btn-primary" @click="generate">{{ buttonLabel }}</button>
                    </div>
                </div>
            </div>
            <div class="col">
                <figure class="figure">
                    <img :src="image" style="width: 50%;" class="figure-img img-thumbnail" :alt="alt">
                    <figcaption class="figure-caption">{{ alt }}</figcaption>
                </figure>
                <div class="card">
                    <div class="card-header">
                        操作
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">已生成图片总量：
                            <span class="badge bg-secondary">{{ store.count }}</span>
                        </li>
                        <li class="list-group-item">会话 ID：
                            <span class="badge bg-secondary"> {{ session ? session : "Azure 会话 ID 可用于回溯" }}</span></li>
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

<style scoped>
#generateButton {
    width: 200px;   
    white-space: nowrap; 
    overflow: hidden; 
    text-align: left; 
}
</style>