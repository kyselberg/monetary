<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	let showDeleteModal = $state(false);

	function handleDelete() {
		showDeleteModal = true;
	}

	function cancelDelete() {
		showDeleteModal = false;
	}

	// Update preview when inputs change
	onMount(() => {
		const colorInput = document.getElementById('color') as HTMLInputElement;
		const textColorInput = document.getElementById('textColor') as HTMLInputElement;
		const previewBadge = document.querySelector('.badge[style*="background-color"]') as HTMLElement;
		const nameInput = document.getElementById('name') as HTMLInputElement;

		if (colorInput && previewBadge) {
			colorInput.addEventListener('input', () => {
				previewBadge.style.backgroundColor = colorInput.value;
			});
		}

		if (textColorInput && previewBadge) {
			textColorInput.addEventListener('input', () => {
				previewBadge.style.color = textColorInput.value;
			});
		}

		if (nameInput && previewBadge) {
			nameInput.addEventListener('input', () => {
				previewBadge.textContent = nameInput.value;
			});
		}
	});
</script>

<div class="container mx-auto p-6 max-w-2xl">
	<div class="mb-6">
		<div class="flex items-center gap-4 mb-4">
			<a href="/categories" class="btn btn-ghost btn-sm">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to categories
			</a>
		</div>
		<h1 class="text-3xl font-bold text-base-content">Edit Category</h1>
		<p class="text-base-content/70 mt-2">Update your category details</p>
	</div>

	{#if form?.success}
		<div class="alert alert-success mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{form.message || 'Category updated successfully!'}</span>
		</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div>
				<span class="font-semibold">{form.message || 'An error occurred'}</span>
				{#if form.error === 'HAS_EXPENSES'}
					<div class="text-sm mt-1">
						To delete this category, you need to either:
						<ul class="list-disc list-inside mt-2 space-y-1">
							<li>Delete all expenses in this category first</li>
							<li>Reassign expenses to other categories</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<form method="POST" action="?/updateCategory" use:enhance>
				<input type="hidden" name="categoryId" value={data.category.id} />

				<div class="form-control mb-4">
					<label class="label" for="name">
						<span class="label-text font-semibold">Category Name</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						class="input input-bordered w-full"
						value={data.category.name}
						required
						placeholder="Enter category name"
					/>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="description">
						<span class="label-text font-semibold">Description</span>
					</label>
					<textarea
						id="description"
						name="description"
						class="textarea textarea-bordered w-full"
						placeholder="Enter category description (optional)"
						rows="3"
					>{data.category.description || ''}</textarea>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<div class="form-control">
						<label class="label" for="color">
							<span class="label-text font-semibold">Background Color</span>
						</label>
						<div class="flex items-center gap-2">
							<input
								type="color"
								id="color"
								name="color"
								class="w-12 h-12 rounded border-2 border-base-300"
								value={data.category.color}
								required
							/>
							<input
								type="text"
								class="input input-bordered flex-1"
								value={data.category.color}
								readonly
							/>
						</div>
					</div>

					<div class="form-control">
						<label class="label" for="textColor">
							<span class="label-text font-semibold">Text Color</span>
						</label>
						<div class="flex items-center gap-2">
							<input
								type="color"
								id="textColor"
								name="textColor"
								class="w-12 h-12 rounded border-2 border-base-300"
								value={data.category.textColor}
								required
							/>
							<input
								type="text"
								class="input input-bordered flex-1"
								value={data.category.textColor}
								readonly
							/>
						</div>
					</div>
				</div>

				<!-- Preview Tag -->
				<div class="mb-6">
					<div class="mb-2">
						<span class="text-sm font-semibold text-base-content">Preview</span>
					</div>
					<div class="flex items-center">
						<span
							class="badge badge-lg"
							style="background-color: {data.category.color}; color: {data.category.textColor};"
						>
							{data.category.name}
						</span>
					</div>
				</div>

				<div class="flex gap-3">
					<button type="submit" class="btn btn-primary flex-1">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Save Changes
					</button>
					<button type="button" class="btn btn-error" onclick={handleDelete}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-lg text-error">Delete Category</h3>
			{#if data.expenseCount > 0}
				<div class="alert alert-warning mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
					<div>
						<div class="font-semibold">Cannot Delete Category</div>
						<div class="text-sm">
							This category has <strong>{data.expenseCount}</strong> associated expense{data.expenseCount === 1 ? '' : 's'}.
							You must delete or reassign all expenses before deleting this category.
						</div>
					</div>
				</div>
				<div class="modal-action">
					<button class="btn btn-ghost" onclick={cancelDelete}>Close</button>
				</div>
			{:else}
				<p class="py-4">
					Are you sure you want to delete the category "<strong>{data.category.name}</strong>"?
					This action cannot be undone.
				</p>
				<div class="modal-action">
					<form method="POST" action="?/deleteCategory" use:enhance>
						<input type="hidden" name="categoryId" value={data.category.id} />
						<button type="submit" class="btn btn-error">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Yes, Delete
						</button>
					</form>
					<button class="btn btn-ghost" onclick={cancelDelete}>Cancel</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
