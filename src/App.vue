<script setup>
import { useGeneratorStore } from "./stores/generator";
import axios from "axios";
const store = useGeneratorStore();
import { ref, watch, onMounted, nextTick } from 'vue';

const placeholderImage = ref("https://generated.vusercontent.net/placeholder.svg");
const image = ref("https://generated.vusercontent.net/placeholder.svg");
const tags = ref([
    '哑光绘画', '点彩画', '浮世绘', '水彩画', '炭笔', '粉彩', '粉笔', '石墨铅笔', '彩色铅笔', '墨水和钢笔', '拼贴画', '丙烯画', '变形', '漆画', '壁画', '水粉画', '涂鸦', '灰粉', '浮雕', '微缩画', '油画', '板画', '沙画', 
    '全景', '透视画', '卷轴画', '涂鸦', '镂空', '纸艺', '三维', '素描', '卡通', '漫画', '|',
    '电影照明', '倾斜摄影', '变形镜头', '等距透视', '全息投影', '|',
    '超精细', '动态图形', '高动态范围', '逼真', '高对比度 ', '|',
    '科幻', '乌托邦', '抽象', '超现实', '超人类主义', '虚构', '机器人', '智能机器', '中世纪现代', '|',
    '装饰艺术', '巴洛克风格', '当代艺术', '立体主义', '野兽派', '未来主义', '几何主义', '印象派', '装置艺术', '极简主义', '新印象派', '新古典主义', '现实主义', '文艺复兴', '浪漫主义', '超现实主义'
]);
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

async function generate() {
    index = 0;
    progress = "";
    //image.value = placeholderImage.value;
    btnElement.value.classList.remove('btn-primary');
    btnElement.value.classList.add('btn-secondary');
    //caption.value = "";
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
                "prompt": prompt.value + ' '
                    + (store.design !=='' ? ' 图片风格：' + store.design : '') 
                    + store.selectedTags.join(' ')
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
        nextTick(() => {
            const container = document.querySelector('.image-scroll-list');
            container.scrollTop = container.scrollHeight;
        });
    }
}
// 点击标签后的操作
const toggleTag = (tag) => {
  const index = store.selectedTags.indexOf(tag);
  if (index > -1) {
    // 已经选中的标签，再次点击则取消选中
    store.selectedTags.splice(index, 1);
  } else {
    // 未选中的标签，点击后加入到选中的标签数组中
    store.selectedTags.push(tag);
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
    let title = event.target.title;
    let extension = imgURL.split('?')[0].split('.').pop();
    fetch(imgURL)
    .then(resp => resp.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    })
    .catch(() => alert('图片下载失败'));
}
</script>

<template>
    <div class="container mb-3">
        <h1 class="my-4">Azure DALL-E 3 图片生成器（{{ store.count }}）</h1>
        <div class="row">
            <div class="col">
                <div class="card mt-1">
                    <div class="card-body conf">
                        <h5 class="card-title">图片配置</h5>
                        <div class="mb-3">
                            <label class="form-label">图片尺寸</label>
                            <select v-model="store.size" class="form-select">
                                <option selected>选择尺寸</option>
                                <option value="1024x1024">1024x1024</option>
                                <option value="1024x1792">1024x1792</option>
                                <option value="1792x1024">1792x1024</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片风格</label>
                            <select v-model="store.style" class="form-select">
                                <option>选择风格</option>
                                <option value="natural">正常</option>
                                <option value="vivid" selected>生动</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">图片质量</label>
                            <select v-model="store.quality" class="form-select">
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
                            <div class="m-2">
                                <div>
                                    <div v-for="(tag, index) in tags" :key="index" :class="{ 'selected-tag': store.selectedTags.includes(tag), 'splitter': tag === '|' }" :style="{ 'border:none': tag === '|' }" class="tag" @click="toggleTag(tag)">{{  tag === '|' ? '' : tag }}</div>
                                </div>
                                <textarea class="form-control" v-model="store.design" rows="1"></textarea>
                            </div>
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
                <div class="card">
                    <div class="card-body conf">
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
                    <img :src="image" class="figure-img img-thumbnail" @load='handleImageLoad' @click='downloadImage' :title="session">
                    <figcaption class="figure-caption" id="caption" v-clipboard:copy="caption" v-clipboard:success="onCopy">{{ caption }}</figcaption>
                </figure>
                <div>会话 ID： <span class="badge bg-secondary" id="session" v-clipboard:copy="session" v-clipboard:success="onCopy"> {{ session ? session : "Azure 会话 ID 可用于回溯" }}</span></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.conf .mb-3 {
    display: flex;
    align-items: center;
}
.conf .mb-3 .form-select,.conf .mb-3 .form-control  {
    flex: 1;
    margin: 5px;
}
.conf .mb-3 .form-label {
    margin-bottom: 0;
}
.tag {
    border: 1px solid #CCC;
    border-radius: 4px;
    display: inline-block;
    margin: 4px;
    padding: 4px;
    line-height: 1em;
    cursor: pointer;
}
.selected-tag {
    background: #FF5722;
    color: #FFF;
}
.splitter {
    border: none;
    padding: 0;
    width: 100%;
}
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