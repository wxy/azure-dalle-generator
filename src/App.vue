<script setup>
import { useGeneratorStore } from "./stores/generator";
import axios from "axios";
const store = useGeneratorStore();
import { ref, watch, onMounted } from 'vue';

const placeholderImage = ref("https://generated.vusercontent.net/placeholder.svg");
const image = ref("https://generated.vusercontent.net/placeholder.svg");
const alt = ref("A caption for the above image.");
const session = ref("");
const prompt = ref("Linux");
const pastImages = ref([]);

// 初始状态下，按钮显示的文字为'生成图片'
let buttonLabel = ref('生成图片');
let buttonInterval = null;  // 创建一个变量来存储计时器ID
let buttonDots = '';  // 创建一个变量来存储点

// 图片生成进度
let loadingInterval = null;  // 定义一个变量来存储计时器ID
const loadingChars = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];  // 定义一组字符来展示滚动
let index = 0;  // 定义一个索引用来跟踪当前显示的字符
let progress = ""; // 定义一个字符串变量来储存进度点

// 获取图片 DOM 元素的引用
let imgElement = ref(null)

onMounted(() => {
    imgElement.value = document.querySelector('.figure-img');
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
    buttonInterval = setInterval(() => {
        // 更新显示的'•'数量
        buttonDots += '•';
        if(buttonDots.length > 3){
            buttonDots = '';
        }

        // 更新按钮的显示
        buttonLabel.value = '生成图片 ' + buttonDots;
    }, 200);

    alt.value = "生成中 " + loadingChars[index];  // 初始化加载信息
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
        alt.value = '生成中 ' + progress + ' ' + loadingChars[index];
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
            if (axiosError.response) {
                alt.value = 'ERR : ' + axiosError.response.data.error.code + ' - ' + axiosError.response.data.error.message;
            }
        } else {
            // 非axios的错误处理方式
            alt.value = error.message;
        }
    }
    // 清除定时器
    clearInterval(buttonInterval);  // 当请求完成时清除计时器
    buttonLabel.value = '生成图片';  // 取消加载状态并恢复原文字
    clearInterval(loadingInterval);

    if (response !== null) {
        // 设置占位图片并添加淡入淡出效果
        imgElement.value.classList.add('img-fade');
        image.value = response.data.data[0].url;

        session.value = image.value.substr(image.value.indexOf('/images/') + 8, 36);

        alt.value = response.data.data[0].revised_prompt;

        pastImages.value.push({
            url: image.value,
            caption: alt.value
        });
        store.count++;
    }
}
const onCopy = e => {
    alert("复制成功")
}
</script>

<template>
    <div class="container mb-3">
        <h1 class="my-4">Azure DALL-E 3 图片生成器</h1>
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
                        <button id="generateButton" class="btn btn-primary" @click="generate">{{ buttonLabel }}</button>
                    </div>
                </div>
            </div>
            <div class="col">
                <figure class="figure">
                    <img :src="image" class="figure-img img-thumbnail" @load='handleImageLoad' :alt="alt">
                    <figcaption class="figure-caption">{{ alt }}</figcaption>
                </figure>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="card mt-1">
                    <div class="card-header">
                        操作
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">已生成图片总量：
                            <span class="badge bg-secondary">{{ store.count }}</span>
                        </li>
                        <li class="list-group-item">会话 ID：
                            <span class="badge bg-secondary"> {{ session ? session : "Azure 会话 ID 可用于回溯" }}</span>
                            <button type="button" v-clipboard:copy="session" v-clipboard:success="onCopy" class="btn btn-primary btn-sm ms-3">复制</button>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="col">
                <div class="card mt-1 image-history">
                    <div class="card-header">
                        历史生成的图片（{{ pastImages.length }}）
                    </div>
                    <div class="image-scroll-list p-3">
                        <div v-for="(pastImage, index) in pastImages" :key="index" class="image-list-item">
                            <a :href="pastImage.url" target="_blank">
                                <img :src="pastImage.url" :alt="pastImage.caption" class="thumbnail">
                            </a>
                        </div>
                    </div>
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
@keyframes fadeInOut {
    0%,100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.img-fade {
    animation: fadeInOut 2s infinite;
}
.image-history {
    margin-top: 20px;
}
.image-scroll-list {
    overflow-x: auto;
    white-space: nowrap;
}
.image-list-item {
    display: inline-block;
    margin-right: 10px;
}
.thumbnail {
    width: 100px;
}
</style>