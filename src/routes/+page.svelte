<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	let { data }: { data: PageServerData } = $props();

	// Modal state
	let showModal = $state(false);
	let showDeleteModal = $state(false);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let expenseToDelete = $state<{ id: string; name: string; amountCents: number; date: Date } | null>(null);
	let expenseToEdit = $state<{ id: string; name: string; amountCents: number; date: Date } | null>(null);

	// Form data
	let formData = $state({
		name: '',
		amount: '',
		date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
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

	// Open modal
	function openModal() {
		showModal = true;
		// Reset form
		formData = {
			name: '',
			amount: '',
			date: new Date().toISOString().split('T')[0]
		};
	}

	// Close modal
	function closeModal() {
		showModal = false;
	}

	// Handle form submission success
	function handleSuccess() {
		closeModal();
		// The page will automatically refresh due to the form submission
	}

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
			date: expense.date.toISOString().split('T')[0]
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
			date: new Date().toISOString().split('T')[0]
		};
	}

	// Handle edit form submission success
	function handleEditSuccess() {
		closeEditModal();
		// The page will automatically refresh due to the form submission
	}

</script>

<svelte:head>
	<title>Expenses - Monetary</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-base-content">Expenses</h1>
		<button class="btn btn-primary" onclick={openModal}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Expense
		</button>
	</div>

	{#if data.expenses && data.expenses.length > 0}
        <!-- Summary Card -->
		<div class="stats shadow mb-6">
			<div class="stat">
				<div class="stat-title">Total Expenses</div>
				<div class="stat-value text-primary">
					{formatAmount(data.summary.total)}
				</div>
				<div class="stat-desc">{data.expenses.length} transactions</div>
			</div>
			<div class="stat">
				<div class="stat-title">Average</div>
				<div class="stat-value text-secondary">
					{formatAmount(data.summary.average)}
				</div>
				<div class="stat-desc">per transaction</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table table-zebra w-full">
						<thead>
							<tr>
								<th class="text-base-content font-semibold">Name</th>
								<th class="text-base-content font-semibold">Date</th>
								<th class="text-base-content font-semibold">Amount</th>
								<th class="text-base-content font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.expenses as expense}
								<tr class="hover">
									<td class="text-base-content font-medium">
										{expense.name}
									</td>
									<td class="text-base-content/70">
										{formatDate(expense.date)}
									</td>
									<td class="text-base-content font-medium">
										<span class="badge badge-outline badge-lg">
											{formatAmount(expense.amountCents)}
										</span>
									</td>
									<td>
										<div class="flex gap-2">
											<button
												class="btn btn-ghost btn-sm"
												onclick={() => openEditModal(expense)}
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
												Edit
											</button>
											<button
												class="btn btn-ghost btn-sm text-error"
												onclick={() => openDeleteModal(expense)}
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
		<div class="hero min-h-96 bg-base-200 rounded-lg">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<h2 class="text-2xl font-bold text-base-content mb-4">No expenses yet</h2>
					<p class="text-base-content/70 mb-6">Start tracking your expenses by adding your first transaction.</p>
					<button class="btn btn-primary btn-lg" onclick={openModal}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Add Your First Expense
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && expenseToDelete}
	<div class="modal modal-open">
		<div class="modal-box">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-2xl font-bold text-base-content">Delete Expense</h3>
				<button class="btn btn-sm btn-circle btn-ghost" onclick={closeDeleteModal} aria-label="Close modal">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="mb-6">
				<p class="text-base-content/80 mb-4">
					Are you sure you want to delete this expense? This action cannot be undone.
				</p>

				<div class="bg-base-200 p-4 rounded-lg">
					<div class="flex justify-between items-center">
						<div>
							<h4 class="font-semibold text-base-content">{expenseToDelete.name}</h4>
							<p class="text-sm text-base-content/70">{formatDate(expenseToDelete.date)}</p>
						</div>
						<div class="text-right">
							<span class="badge badge-outline badge-lg">
								{formatAmount(expenseToDelete.amountCents)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={closeDeleteModal} disabled={isSubmitting}>
					Cancel
				</button>
				<form use:enhance={handleDeleteSuccess} action="?/deleteExpense" method="post">
					<input type="hidden" name="expenseId" value={expenseToDelete.id} />
					<button class="btn btn-error" type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
							Deleting...
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Delete Expense
						{/if}
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Expense Modal -->
{#if showEditModal && expenseToEdit}
	<div class="modal modal-open">
		<div class="modal-box">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-2xl font-bold text-base-content">Edit Expense</h3>
				<button class="btn btn-sm btn-circle btn-ghost" onclick={closeEditModal} aria-label="Close modal">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form use:enhance={handleEditSuccess} action="?/updateExpense" method="post">
				<input type="hidden" name="expenseId" value={expenseToEdit.id} />

				<div class="form-control mb-4">
					<label class="label" for="edit-name">
						<span class="label-text font-semibold">Expense Name</span>
					</label>
					<input
						type="text"
						id="edit-name"
						name="name"
						class="input input-bordered w-full"
						placeholder="e.g., Groceries, Gas, Coffee"
						bind:value={formData.name}
						required
						disabled={isSubmitting}
					/>
					<div class="label">
						<span class="label-text-alt text-base-content/60">Enter a descriptive name for this expense</span>
					</div>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="edit-amount">
						<span class="label-text font-semibold">Amount</span>
					</label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 z-10">₴</span>
						<input
							type="number"
							id="edit-amount"
							name="amount"
							class="input input-bordered w-full pl-8"
							placeholder="0.00"
							step="1"
							min="0"
							bind:value={formData.amount}
							required
							disabled={isSubmitting}
						/>
					</div>
					<div class="label">
						<span class="label-text-alt text-base-content/60">Enter the expense amount in UAH</span>
					</div>
				</div>

				<div class="form-control mb-6">
					<label class="label" for="edit-date">
						<span class="label-text font-semibold">Date</span>
					</label>
					<input
						type="date"
						id="edit-date"
						name="date"
						class="input input-bordered w-full"
						bind:value={formData.date}
						required
						disabled={isSubmitting}
					/>
					<div class="label">
						<span class="label-text-alt text-base-content/60">Select the date when this expense occurred</span>
					</div>
				</div>

				<div class="modal-action">
					<button class="btn btn-ghost" type="button" onclick={closeEditModal} disabled={isSubmitting}>
						Cancel
					</button>
					<button class="btn btn-primary" type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
							Updating...
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
							Update Expense
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Add Expense Modal -->
{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-2xl font-bold text-base-content">Add New Expense</h3>
				<button class="btn btn-sm btn-circle btn-ghost" onclick={closeModal} aria-label="Close modal">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form use:enhance={handleSuccess} action="?/createExpense" method="post">
				<div class="form-control mb-4">
					<label class="label" for="name">
						<span class="label-text font-semibold">Expense Name</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						class="input input-bordered w-full"
						placeholder="e.g., Groceries, Gas, Coffee"
						bind:value={formData.name}
						required
						disabled={isSubmitting}
					/>
					<div class="label">
						<span class="label-text-alt text-base-content/60">Enter a descriptive name for this expense</span>
					</div>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="amount">
						<span class="label-text font-semibold">Amount</span>
					</label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 z-10">₴</span>
						<input
							type="number"
							id="amount"
							name="amount"
							class="input input-bordered w-full pl-8"
							placeholder="0.00"
							step="1"
							min="0"
							bind:value={formData.amount}
							required
							disabled={isSubmitting}
						/>
					</div>
					<div class="label">
						<span class="label-text-alt text-base-content/60">Enter the expense amount in UAH</span>
					</div>
				</div>

				<div class="form-control mb-6">
					<label class="label" for="date">
						<span class="label-text font-semibold">Date</span>
					</label>
					<input
						type="date"
						id="date"
						name="date"
						class="input input-bordered w-full"
						bind:value={formData.date}
						required
						disabled={isSubmitting}
					/>
					<div class="label">
						<span class="label-text-alt text-base-content/60">Select the date of the expense</span>
					</div>
				</div>

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={closeModal} disabled={isSubmitting}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
							Adding...
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Add Expense
						{/if}
					</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={closeModal} onkeydown={(e) => e.key === 'Escape' && closeModal()} role="button" tabindex="0" aria-label="Close modal"></div>
	</div>
{/if}