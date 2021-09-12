<template>
    <div class="container pt-3 pb-3">
      <div class="card card-custom p-5">
        <h4>{{ post.subject }}</h4>
        <h5>{{ post.from_name}} ({{ post.from_address }})</h5>
        <hr />
        <div class="container">
          <small class="pb-3 show-white-space">{{ post.content }}</small>
        </div>
      </div>
    </div>
</template>

<script>
  export default {
    props: {
      post: {
        type: Object,
        default: () => {}
      }
    }
  }
</script>
