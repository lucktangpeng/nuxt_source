<template>
  <div>
    <div id="app">
      <h1>{{ message }}</h1>
    </div>
    <div>
      <input type="text" v-model="message" />
      <button @click="handleClick">按钮</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      message: "拉钩教育",
    };
  },
  methods: {
    handleClick() {
      console.log("button");
    },
  },
};
</script>

<style lang="scss" scoped></style>
