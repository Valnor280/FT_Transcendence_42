<template>
  <div class="leaderboard__item">
    <span class="leaderboard__score">
      {{ user.leftname }} VS {{user.rightname}}
    </span>
  </div>
</template>

<script>
export default {
  name: "matchItem",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
/* .leaderboard__item {
  align-items: space-between;
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
  padding: 0.25rem;
} */
.leaderboard__user {
  text-align: center;
  color: white;
  width: 30%;
}
.leaderboard__score {
  text-align: center;
  color: gold;
  width: 30%;
}

</style>