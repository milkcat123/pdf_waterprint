<template>
  <div id="app">
    <h1>PDF增加浮水印工具</h1>
    <p>*目前僅英文，有方法更改成中文字體(待實踐)</p>
    <ReportView/>
  </div>
</template>

<script>
import ReportView from './components/ReportView.vue'

export default {
  name: 'App',
  components: {
    ReportView
  }
}
</script>

<style>
</style>
