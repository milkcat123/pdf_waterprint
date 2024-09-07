<template>
  <button
    @click="open = true"
    class="wrap_author"
    :class="{ open: open }"
    @blur="open = false"
  >
    <div><i class="bi bi-info-circle-fill"></i></div>

    <div v-show="open" class="wrap_info">
      <p class="title">作者資訊</p>
      <p class="author">開發者：{{ author }}</p>
      <p class="note">說明：使用PDF-Lib套件，僅練習用，非商用。</p>
      <p>{{ repo }}</p>
    </div>
  </button>
</template>
<script>
export default {
  data() {
    return {
      author: "Yuki Hiew",
      repo: "https://github.com/milkcat123/pdf_waterprint",
      open: false,
    };
  },
  methods: {
  },
};
</script>
<style lang="scss" scoped>
.wrap_author {
  display: inline-flex;
  position: fixed;
  justify-content: center;
  align-items: center;
  text-align: center;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  &.open {
    background: #fff;
    width: 380px;
    height: 100px;
    border-radius: 5px;
    cursor: default;
    pointer-events: none;
    i.bi {
      color: #ffa724;
    }
  }
  .title {
    font-weight: bold;
  }
  .wrap_info {
    text-align: left;
    padding: 10px 0px 10px 20px;
  }
  p {
    line-height: 1.5;
  }
  i.bi {
    color: #ffa82479;
    font-size: 30px;
    line-height: 30px;
    transition: 0.3s;
    &:hover {
      color: #ffa724;
      transition: 0.3s;
    }
  }
}
</style>