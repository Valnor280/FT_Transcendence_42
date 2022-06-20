<template>
  <div class="leaderboard__item">
    <span class="leaderboard__user">{{ user.username }}</span>
    <span class="leaderboard__score">
      {{ user.rank }} {{ user.rank === 1 ? "point" : "points" }}
    </span>
  </div>
</template>

<script lang="ts">
export default {
  name: "LeaderboardItem",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.leaderboard__item {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  padding: 0.25rem;
}
.leaderboard__user {
  text-align: left;
  color: white;
  width: 30%;
}
.leaderboard__score {
  text-align: right;
  color: gold;
  width: 30%;
}

</style>