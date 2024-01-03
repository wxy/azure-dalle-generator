<template>
    <div class="tags">
      <div class="mb-1" v-for="(categoryTags, categoryName) in tags" :key="categoryName">
        <label class="form-label">{{ categoryName }} ：</label>
        <div>
          <div 
            v-for="(tag, index) in categoryTags" 
            :key="index" 
            :class="{ 'selected-tag': selectedTags[categoryName] && selectedTags[categoryName].includes(tag) }" 
            class="tag" 
            @click="toggleTag(categoryName, tag)">
            {{ tag }}
          </div>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  props: ['tags', 'selectedTags'],
  methods: {
    toggleTag(category, tag) {
      if (!this.selectedTags[category]) this.selectedTags[category] = [];
      const index = this.selectedTags[category].indexOf(tag);
      if (index > -1) {
        this.selectedTags[category].splice(index, 1);
      } else {
        this.selectedTags[category].push(tag);
      }
    },
    selectedTagsToString() {
        let result = '';
        for (let category in this.selectedTags) {
        if (this.selectedTags[category].length > 0) {
            result += category + '：' + this.selectedTags[category].join('，') + '；';
        }
        }
        return result;
    }
  }
}
</script>

<style scoped>
/* 标签 */
.tags {
    font-size: 12px;
}
.tags .mb-1 {
    background-color: var(--color-block);
    border: 1px solid var(--color-border);
    padding: 0 4px;
    margin: 4px;
    border-radius: 4px;
}
.tags .mb-1 .form-label {
    min-width: 65px;
}
.tag {
    background-color: #CCC;
    color: #333;
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
</style>
