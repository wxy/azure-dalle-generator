<script setup>
import { useGeneratorStore } from "./stores/generator";
import axios from "axios";
import { ref, watch, onMounted, nextTick } from 'vue';
import './style.css';
import TagComponent from './TagComponent.vue';

const store = useGeneratorStore();
const image = ref("https://generated.vusercontent.net/placeholder.svg");
const tags = ref({
    "绘画形式": ['水彩画', '粉彩画', '点彩画', '粉笔画', '油画', '版画', '素描', '水墨', '中国画', '纸艺', '喷绘', '沙画', '卷轴', '雕刻', '壁画'],
    "绘画材质": ['画纸', '画布', '木板', '哑光', '镜面', '有纹理', '无纹理'],
    "构图视角": ['全景', '透视', '三维', '顶视'],
    "绘画类别": ['科幻', '历史', '中世纪', '抽象', '超现实', '肖像', '风景', '漫画', '卡通'],
    "风格流派": ['装饰艺术', '立体主义', '未来主义', '实用主义', '复古主义', '野性派'],
    "光线投影": ['自然光', '人造光', '逆光', '侧光'] 
});
const tagComponent = ref(null);
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
watch(() => store.theme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
});
async function generate() {
    index = 0;
    progress = "";
    btnElement.value.classList.remove('btn-primary');
    btnElement.value.classList.add('btn-secondary');
    if (loadingInterval !== null) {
        clearInterval(loadingInterval);
    }
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
                "prompt": '图像主题：' + prompt.value + '。'
                    + ((tagComponent.value) ? tagComponent.value.selectedTagsToString() : '') 
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

        session.value = image.value.substring(image.value.indexOf('/images/') + 8, image.value.indexOf('/images/') + 8 + 36);

        caption.value = response.data.data[0].revised_prompt;

        pastImages.value.push({
            url: image.value,
            caption: caption.value,
            session: session.value
        });
        store.count++;
        nextTick(() => {
            const container = document.querySelector('.image-scroll-list');
            container.scrollTop = container.scrollHeight;
        });
    }
}
const onCopy = (event) => {
    event.trigger.classList.add('copy-fade');
    event.trigger.addEventListener('animationend', function callback() {
        event.trigger.classList.remove('copy-fade');
        event.trigger.removeEventListener('animationend', callback);
    });
}
const changeImage = (url, alt, title) => {
    image.value = url;
    caption.value = alt;
    session.value = title;
}
// 图片加载完成的处理函数
const handleImageLoad = () => {
    // 移除淡入淡出效果
    imgElement.value.classList.remove('img-fade');
}
const downloadImage = (event) => {
    let imgURL = event.target.src;
    let session = event.target.alt;
    let extension = imgURL.split('?')[0].split('.').pop();
    fetch(imgURL)
    .then(resp => resp.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${session}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    })
    .catch(() => alert('图片下载失败'));
}
// 添加一个新的方法来切换主题
const switchTheme = () => {
    store.toggleTheme()
}
</script>

<script>
  export default {
    components: {
      TagComponent,
    }
  }
</script>

<template>
    <div class="container mb-3">
        <h1 class="my-4">Azure DALL-E 3 图片生成器（{{ store.count }}）</h1>
        <button id='theme-toggle-button' @click='switchTheme'> <i :class='store.theme === "light" ? "fas fa-moon" : "fas fa-sun"'></i></button>
        <div class="row">
            <div class="col">
                <div class="card mt-1">
                    <div class="card-body conf">
                        <h5 class="card-title">图片配置</h5>
                        <div class="mb-1">
                            <label class="form-label">图片尺寸</label>
                            <select v-model="store.size" class="form-select">
                                <option selected>选择尺寸</option>
                                <option value="1024x1024">1024x1024</option>
                                <option value="1024x1792">1024x1792</option>
                                <option value="1792x1024">1792x1024</option>
                            </select>
                        </div>
                        <div class="mb-1">
                            <label class="form-label">图片风格</label>
                            <select v-model="store.style" class="form-select">
                                <option>选择风格</option>
                                <option value="natural">正常</option>
                                <option value="vivid" selected>生动</option>
                            </select>
                        </div>
                        <div class="mb-1">
                            <label class="form-label">图片质量</label>
                            <select v-model="store.quality" class="form-select">
                                <option>选择图片质量</option>
                                <option value="standard">标准</option>
                                <option value="hd" selected>高清</option>
                            </select>
                        </div>
                        <div class="mb-1">
                            <label class="form-label">图片描述</label>
                            <textarea class="form-control" v-model="prompt" rows="5"></textarea>
                        </div>
                        <div class="mb-1">
                            <label class="form-label">图片属性</label>
                            <TagComponent ref='tagComponent' :tags='tags' :selectedTags='store.selectedTags' />
                        </div>
                        <div class="mb-1">
                            <label class="form-label">图片背景</label>
                            <fieldset class="form-control bgs">
                                <input type="radio" name="background" id="background_-1" value="" class="m-2" v-model="store.background">
                                <label for="background_-1">不指定</label>
                                <input type="radio" name="background" id="background_1" value="红色" class="m-2" v-model="store.background">
                                <label for="background_1">赤</label>
                                <input type="radio" name="background" id="background_2" value="橙色" class="m-2" v-model="store.background">
                                <label for="background_2">橙</label>
                                <input type="radio" name="background" id="background_3" value="黄色" class="m-2" v-model="store.background">
                                <label for="background_3">黄</label>
                                <input type="radio" name="background" id="background_4" value="绿色" class="m-2" v-model="store.background">
                                <label for="background_4">绿</label>
                                <input type="radio" name="background" id="background_5" value="青色" class="m-2" v-model="store.background">
                                <label for="background_5">青</label>
                                <input type="radio" name="background" id="background_6" value="蓝色" class="m-2" v-model="store.background">
                                <label for="background_6">蓝</label>
                                <input type="radio" name="background" id="background_0" value="粉紫色" class="m-2" v-model="store.background">
                                <label for="background_0">紫</label>
                            </fieldset>
                        </div>
                        <div class="mb-1">
                            <button id="generateButton" class="btn btn-primary" @click="generate">生成图片</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card mt-1">
                    <div class="card-body conf">
                        <h5 class="card-title">服务配置</h5>
                        <div class="mb-1">
                            <label class="form-label">API Endpoint</label>
                            <input type="text" v-model="store.url" class="form-control" placeholder="API Endpoint">
                        </div>
                        <div class="mb-1">
                            <label class="form-label">API Key</label>
                            <input type="text" v-model="store.key" class="form-control" placeholder="API Endpoint">
                        </div>
                    </div>
                </div>
                <div class="card mt-1 image-history">
                    <div class="card-header">
                            历史生成的图片（{{ pastImages.length }}）
                    </div>
                    <div class="card-body">
                        <div class="image-scroll-list p-1">
                            <div v-for="(pastImage, index) in pastImages" :key="index" class="image-list-item">
                                <img :src="pastImage.url" class="thumbnail" @click="changeImage(pastImage.url, pastImage.caption, pastImage.session)">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card mt-1">
                    <div class="card-body">
                        <figure class="figure mt-1">
                            <img :src="image" class="figure-img" @load='handleImageLoad' @click='downloadImage' title="点击保存图片" :alt="session">
                            <figcaption class="figure-caption" id="caption" v-clipboard:copy="caption" v-clipboard:success="onCopy">{{ caption }}</figcaption>
                        </figure>
                        <div>会话 ID： <span class="badge bg-secondary" id="session" v-clipboard:copy="session" v-clipboard:success="onCopy"> {{ session ? session : "Azure 会话 ID 可用于回溯" }}</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>