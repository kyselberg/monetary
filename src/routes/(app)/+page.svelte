<script lang="ts">
	import DeleteExpenseModal from '$lib/components/DeleteExpenseModal.svelte';
	import EditExpenseModal from '$lib/components/EditExpenseModal.svelte';
	import type { PageServerData } from './$types';
	let { data }: { data: PageServerData } = $props();

	// Modal state for edit/delete modals
	let showDeleteModal = $state(false);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let expenseToDelete = $state<{
		id: string;
		name: string;
		amountCents: number;
		date: Date;
	} | null>(null);
	let expenseToEdit = $state<{ id: string; name: string; amountCents: number; date: Date } | null>(
		null
	);

	// Form data for single expense (edit modal)
	let formData = $state({
		name: '',
		amount: '',
		date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
		categoryId: ''
	});

	// Format amount from cents to UAH
	function formatAmount(cents: number): string {
		return new Intl.NumberFormat('uk-UA', {
			style: 'currency',
			currency: 'UAH'
		}).format(cents / 100);
	}

	// Format date
	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}

	function getCategoryById(categoryId: string | null | undefined) {
		if (!categoryId) return null;
		return data.categories.find((c) => c.id === categoryId) ?? null;
	}

	// Note: Add/Create modals are now handled by the layout component

	// Open delete confirmation modal
	function openDeleteModal(expense: { id: string; name: string; amountCents: number; date: Date }) {
		expenseToDelete = expense;
		showDeleteModal = true;
	}

	// Close delete confirmation modal
	function closeDeleteModal() {
		showDeleteModal = false;
		expenseToDelete = null;
	}

	// Handle delete confirmation
	function handleDeleteSuccess() {
		closeDeleteModal();
		// The page will automatically refresh due to the form submission
	}

	// Open edit modal
	function openEditModal(expense: { id: string; name: string; amountCents: number; date: Date }) {
		expenseToEdit = expense;
		// Pre-populate form with expense data
		formData = {
			name: expense.name,
			amount: (expense.amountCents / 100).toFixed(2),
			date: expense.date.toISOString().split('T')[0],
			categoryId: (expense as unknown as { categoryId?: string | null }).categoryId ?? ''
		};
		showEditModal = true;
	}

	// Close edit modal
	function closeEditModal() {
		showEditModal = false;
		expenseToEdit = null;
		// Reset form
		formData = {
			name: '',
			amount: '',
			date: new Date().toISOString().split('T')[0],
			categoryId: ''
		};
	}

	// Handle edit form submission success
	function handleEditSuccess() {
		closeEditModal();
		// The page will automatically refresh due to the form submission
	}

	// Handle form data changes from the modal
	function handleFormDataChange(newFormData: typeof formData) {
		formData = newFormData;
	}

	// Note: Multi-expense functions are now handled by the layout component

	// Note: Modals are now handled by the layout component
</script>

<svelte:head>
	<title>Expenses - Monetary</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	{#if data.expenses && data.expenses.length > 0}
		<!-- Summary Card -->
		<div class="stats mb-6 shadow">
			<div class="stat">
				<div class="stat-title">Total Expenses</div>
				<div class="stat-value text-primary">
					{formatAmount(data.summary.total)}
				</div>
				<div class="stat-desc">{data.expenses.length} transactions</div>
			</div>
			<div class="stat">
				<div class="stat-title">Most Frequent</div>
				<div class="stat-value text-secondary">
					{#if data.mostFrequentCategories && data.mostFrequentCategories.length > 0}
						{getCategoryById(data.mostFrequentCategories[0].categoryId)?.name || 'Uncategorized'}
					{:else}
						-
					{/if}
				</div>
				<div class="stat-desc">
					{#if data.mostFrequentCategories && data.mostFrequentCategories.length > 0}
						{data.mostFrequentCategories[0].count} transactions
					{:else}
						0 transactions
					{/if}
				</div>
			</div>
			<div class="stat">
				<div class="stat-title">Biggest Category</div>
				<div class="stat-value text-accent">
					{#if data.biggestCategories && data.biggestCategories.length > 0}
						{getCategoryById(data.biggestCategories[0].categoryId)?.name || 'Uncategorized'}
					{:else}
						-
					{/if}
				</div>
				<div class="stat-desc">
					{#if data.biggestCategories && data.biggestCategories.length > 0}
						{formatAmount(data.biggestCategories[0].amount)}
					{:else}
						{formatAmount(0)}
					{/if}
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table w-full table-zebra">
						<thead>
							<tr>
								<th class="font-semibold text-base-content">Name</th>
								<th class="font-semibold text-base-content">Date</th>
								<th class="font-semibold text-base-content">Amount</th>
								<th class="font-semibold text-base-content">Category</th>
								<th class="font-semibold text-base-content">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.expenses as expense (expense.id)}
								<tr class="hover">
									<td class="font-medium text-base-content">
										{expense.name}
									</td>
									<td class="text-base-content/70">
										{formatDate(expense.date)}
									</td>
									<td class="font-medium text-base-content">
										<span class="badge badge-outline badge-lg">
											{formatAmount(expense.amountCents)}
										</span>
									</td>
									<td class="font-medium text-base-content">
										{#if getCategoryById(expense.categoryId)}
											{#key expense.categoryId}
												<a
													href={`/expenses/${expense.categoryId}`}
													class="badge badge-lg"
													style="background-color: {getCategoryById(expense.categoryId)
														?.color}; color: {getCategoryById(expense.categoryId)?.textColor}"
													role="button"
													tabindex="0"
												>
													{getCategoryById(expense.categoryId)?.name}
												</a>
											{/key}
										{:else}
											<span class="badge badge-ghost badge-lg">Uncategorized</span>
										{/if}
									</td>
									<td>
										<div class="flex gap-2">
											<button class="btn btn-ghost btn-sm" onclick={() => openEditModal(expense)}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
												Edit
											</button>
											<button
												class="btn text-error btn-ghost btn-sm"
												onclick={() => openDeleteModal(expense)}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
												Delete
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{:else}
		<div class="hero min-h-96 rounded-lg bg-base-200">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto mb-4 h-24 w-24 text-base-content/20"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<h2 class="mb-4 text-2xl font-bold text-base-content">No expenses yet</h2>
					<p class="mb-6 text-base-content/70">
						Start tracking your expenses by adding your first transaction.
					</p>
					<p class="text-base-content/70">
						Use the floating button in the bottom-right corner to add your first expenses
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
<DeleteExpenseModal
	show={showDeleteModal}
	expense={expenseToDelete}
	{isSubmitting}
	onClose={closeDeleteModal}
	onSuccess={handleDeleteSuccess}
/>

<!-- Edit Expense Modal -->
<EditExpenseModal
	show={showEditModal}
	expense={expenseToEdit}
	{formData}
	categories={data.categories}
	{isSubmitting}
	onClose={closeEditModal}
	onSuccess={handleEditSuccess}
	onFormDataChange={handleFormDataChange}
/>

<!-- Modals are now handled by the layout component -->
