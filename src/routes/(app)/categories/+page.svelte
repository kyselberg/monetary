<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Note: Category modal is now handled by the layout component

	function handleCategoryClick(categoryId: string) {
		goto(`/categories/${categoryId}`);
	}

	function handleMenuClick(event: Event, categoryId: string) {
		event.stopPropagation();
		// TODO: Implement menu functionality
		console.log('Menu clicked for category:', categoryId);
	}

	// Note: Category modal functions are now handled by the layout component

	// Note: Modals are now handled by the layout component
</script>

<div class="container mx-auto p-6">

	{#if data.categories.length === 0}
		<div class="text-center py-12">
			<div class="text-6xl mb-4">📁</div>
			<h3 class="text-xl font-semibold text-base-content mb-2">No categories yet</h3>
			<p class="text-base-content/70">Create your first category to get started</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.categories as category (category.id)}
				<div
					class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
					style="background-color: {category.color}; color: {category.textColor};"
					onclick={() => handleCategoryClick(category.id)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && handleCategoryClick(category.id)}
				>
					<div class="card-body p-6">
						<div class="flex justify-between items-start mb-3">
							<h2 class="card-title text-xl font-bold truncate flex-1 mr-2">
								{category.name}
							</h2>
						</div>
						<p class="text-sm opacity-80 leading-relaxed">
							{category.description || `No description provided for ${category.name.toLowerCase()} category`}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.card {
		border-radius: 12px;
		transition: all 0.2s ease-in-out;
	}

	.card:hover {
		transform: translateY(-2px);
	}

	.card:focus {
		outline: 2px solid hsl(var(--p));
		outline-offset: 2px;
	}
</style>

<!-- Modals are now handled by the layout component -->