<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<h1>Expenses</h1>
	<nav>
		<a href="/">Home</a>
		<a href="/categories">Categories</a>
	</nav>
</header>
{@render children?.()}
