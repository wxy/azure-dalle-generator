<script setup>
import { useGeneratorStore } from "./stores/generator";
import axios from "axios";
const store = useGeneratorStore();
import { ref, watch, onMounted } from 'vue';

const placeholderImage = ref("https://generated.vusercontent.net/placeholder.svg");
const image = ref("https://generated.vusercontent.net/placeholder.svg");
const caption = ref("");
const session = ref("");
const prompt = ref("Linux");
const pastImages = ref([]);

// 图片生成进度
let loadingInterval = null;  // 定义一个变量来存储计时器ID
const loadingChars = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];  // 定义一组字符来展示滚动
let index = 0;  // 定义一个索引用来跟踪当前显示的字符
let progress = ""; // 定义一个字符串变量来储存进度点

// 获取图片 DOM 元素的引用
let imgElement = ref(null);
let btnElement = ref(null);

onMounted(() => {
    imgElement.value = document.querySelector('.figure-img');
    btnElement.value = document.querySelector('#generateButton');
})

// 图片加载完成的处理函数
function handleImageLoad() {
    // 移除淡入淡出效果
    imgElement.value.classList.remove('img-fade');
}

async function generate() {
    index = 0;
    progress = "";
    image.value = placeholderImage.value;
    btnElement.value.classList.remove('btn-primary');
    btnElement.value.classList.add('btn-secondary');
    caption.value = "";
    loadingInterval = setInterval(() => {
        index++;
        // 当完成一次完整的旋转后，我们添加一个 '•'
        if (index === loadingChars.length) {
            index = 0; // 重置旋转字符的索引
            if (progress.length > 0 && progress.length % 10 === 9) {
                progress += ' ' // 添加进度点
            } else {
                progress += '•' // 添加进度点
            }
        }

        // 使用进度点和当前的旋转字符更新显示的字符串
        session.value = '生成中 ' + progress + ' ' + loadingChars[index];
    }, 125);

    let response = null;
    try {
        response = await axios({
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
                "prompt": prompt.value 
                    + (store.design !=='' ? ' 图片风格：' + store.design : '') 
                    + (store.background !== '' ? ' 图片背景：' + store.background : ''),
                "quality": store.quality,
                "style": store.style
            }
        })
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.data.error) {
                const { code, message } = axiosError.response.data.error;
                caption.value = 'ERR : ' + code + ' - ' + message;
            }
        } else {
            // 非 axios 的错误处理方式
            caption.value = error.message;
        }
    }
    // 清除定时器
    clearInterval(loadingInterval);
    btnElement.value.classList.add('btn-primary');
    btnElement.value.classList.remove('btn-secondary');

    if (response !== null) {
        // 设置占位图片并添加淡入淡出效果
        imgElement.value.classList.add('img-fade');
        image.value = response.data.data[0].url;

        session.value = image.value.substr(image.value.indexOf('/images/') + 8, 36);

        caption.value = response.data.data[0].revised_prompt;

        pastImages.value.push({
            url: image.value,
            caption: caption.value,
            session: session.value
        });
        store.count++;
    }
}
const onCopy = e => {
    e.trigger.classList.add('copy-fade');
    e.trigger.addEventListener('animationend', function callback() {
        e.trigger.classList.remove('copy-fade');
        e.trigger.removeEventListener('animationend', callback);
    });
}
const changeImage = (url, alt, title) => {
    image.value = url;
    caption.value = alt;
    session.value = title;
}
</script>

<template>
    <div class="container mb-3">
        <h1 class="my-4">Azure DALL-E 3 图片生成器（{{ store.count }}）</h1>
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">服务配置</h5>
                        <div class="mb-3">
                            <label class="form-label">API Endpoint</label>
                            <input type="text" v-model="store.url" class="form-control" placeholder="API Endpoint">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">API Key</label>
                            <input type="text" v-model="store.key" class="form-control" placeholder="API Endpoint">
                        </div>
                    </div>
                </div>
                <div class="card mt-1">
                    <div class="card-body">
                        <h5 class="card-title">图片配置</h5>
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
                                <option>选择风格</option>
                                <option value="natural">正常</option>
                                <option value="vivid" selected>生动</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片质量</label>
                            <select v-model="store.quality" class="form-select" aria-label="Default select example">
                                <option>选择图片质量</option>
                                <option value="standard">标准</option>
                                <option value="hd" selected>高清</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片描述</label>
                            <textarea class="form-control" v-model="prompt" rows="5"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片样式</label>
                            <textarea class="form-control" v-model="store.design" rows="1"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片背景</label><br />
                            <input type="radio" name="background" id="background_-1" value="" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_-1">不指定</label>
                            <input type="radio" name="background" id="background_1" value="红色" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_1">赤</label>
                            <input type="radio" name="background" id="background_2" value="橙色" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_2">橙</label>
                            <input type="radio" name="background" id="background_3" value="黄色" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_3">黄</label>
                            <input type="radio" name="background" id="background_4" value="绿色" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_4">绿</label>
                            <input type="radio" name="background" id="background_5" value="青色" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_5">青</label>
                            <input type="radio" name="background" id="background_6" value="蓝色" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_6">蓝</label>
                            <input type="radio" name="background" id="background_0" value="粉紫色" class="m-2" v-model="store.background">
                            <label class="form-label" for="background_0">紫</label>
                        </div>
                        <button id="generateButton" class="btn btn-primary" @click="generate">生成图片</button>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card mt-1 image-history">
                    <div class="card-header">
                        历史生成的图片（{{ pastImages.length }}）
                    </div>
                    <div class="image-scroll-list p-3">
                        <div v-for="(pastImage, index) in pastImages" :key="index" class="image-list-item">
                            <img :src="pastImage.url" :alt="pastImage.caption" :title="pastImage.session" class="thumbnail" @click="changeImage(pastImage.url, pastImage.caption, pastImage.session)">
                        </div>
                    </div>
                </div>
                <figure class="figure mt-1">
                    <a :href="image" target="_blank"><img :src="image" class="figure-img img-thumbnail" @load='handleImageLoad'></a>
                    <figcaption class="figure-caption" id="caption" v-clipboard:copy="caption" v-clipboard:success="onCopy">{{ caption }}</figcaption>
                </figure>
                <div>会话 ID： <span class="badge bg-secondary" id="session" v-clipboard:copy="session" v-clipboard:success="onCopy"> {{ session ? session : "Azure 会话 ID 可用于回溯" }}</span></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.figure {
    text-align: center;
    width: 100%;
}
.figure-img {
    max-height: 500px;
}
.figure-caption{
    text-align: left;
}

@keyframes fadeInOut {
    0%,100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.img-fade {
    animation: fadeInOut 2s infinite;
}
.copy-fade {
    animation: fadeInOut 0.5s 1;
}
.image-history {
    margin-top: 20px;
}
.image-scroll-list {
    overflow-x: auto;
    white-space: nowrap;
    height: 132px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
}
.image-list-item {
    display: inline-block;
    margin: 10px;
    background: #EEE;
    height: 80px;
    width: 80px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
.image-list-item:hover {
    background: #EEC;
}
.thumbnail {
    max-width: 78px;
    max-height: 78px;
}
#session {
    cursor: copy;
}
#caption {
    cursor: copy;
}
</style>