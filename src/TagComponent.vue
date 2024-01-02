<template>
  <div><div class='mb-1'  v-for='(categoryTags, categoryName) in tags' :key='categoryName'>
        <label class='form-label'>{{ categoryName }} ：</label>
        <div><div 
v-for='(tag, index) in categoryTags' 
:key='index' 
:class="{ 'selected-tag': selectedTags[categoryName] && selectedTags[categoryName].includes(tag) }" 
class='tag' 
@click='toggleTag(categoryName, tag)'>{{ tag }}</div></div>
  </div></div>
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