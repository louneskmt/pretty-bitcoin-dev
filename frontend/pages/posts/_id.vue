<template>
	<div>
		<Post :post="post"/>
		<div class="overflow-auto">
			<b-pagination-nav :pages="pages" align="center"></b-pagination-nav>
		</div>
	</div>
</template>

<script>
export default {
	async asyncData({ params, $axios }) {
		const post = await $axios.$get(`http://${process.env.API_URL}/api/v1/posts/${params.id}`);
		const ids = await $axios.$get(`http://${process.env.API_URL}/api/v1/posts/ids`);
		const pages = ids.map(id => {
			return { link: `/posts/${id}`, text: `${id}` };
		});
		return { post, pages };
	},
	data() {
		return {
			post: {}
		}
	},
	methods: {
	}
}
</script>