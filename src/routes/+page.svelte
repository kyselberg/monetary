<script lang="ts">
	import { enhance } from '$app/forms';
	import { nanoid } from 'nanoid';
	import type { PageServerData } from './$types';
	let { data }: { data: PageServerData } = $props();

	// Modal state
	let showModal = $state(false);
	let showCategoryModal = $state(false);
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
		id: '',
		name: '',
		amount: '',
		date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
		categoryId: ''
	});

	// Multi-expense form data
	let multiExpenseData = $state({
		expenses: [
			{
				id: '',
				name: '',
				amount: '',
				date: new Date().toISOString().split('T')[0],
				categoryId: ''
			}
		]
	});

	// Create category form data
	let categoryForm = $state({
		name: '',
		color: '#000000',
		textColor: '#ffffff'
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

	// Open modal
	function openModal() {
		showModal = true;
		// Reset form
		formData = {
			id: nanoid(),
			name: '',
			amount: '',
			date: new Date().toISOString().split('T')[0],
			categoryId: ''
		};
		// Reset multi-expense form
		multiExpenseData = {
			expenses: [
				{
					id: nanoid(),
					name: '',
					amount: '',
					date: new Date().toISOString().split('T')[0],
					categoryId: ''
				}
			]
		};
	}

	// Close modal
	function closeModal() {
		showModal = false;
	}

	function openCategoryModal() {
		showCategoryModal = true;
		categoryForm = { name: '', color: '#000000', textColor: '#ffffff' };
	}

	function closeCategoryModal() {
		showCategoryModal = false;
	}

	// Handle form submission success
	function handleSuccess() {
		closeModal();
		// The page will automatically refresh due to the form submission
	}

	function handleCategorySuccess() {
		closeCategoryModal();
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
			id: expense.id,
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
			id: nanoid(),
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

	// Multi-expense form management
	function addExpenseRow() {
		multiExpenseData.expenses.push({
			id: nanoid(),
			name: '',
			amount: '',
			date: new Date().toISOString().split('T')[0],
			categoryId: ''
		});
	}

	function removeExpenseRow(index: number) {
		if (multiExpenseData.expenses.length > 1) {
			multiExpenseData.expenses.splice(index, 1);
		}
	}

	function clearAllExpenses() {
		multiExpenseData.expenses = [
			{
				id: nanoid(),
				name: '',
				amount: '',
				date: new Date().toISOString().split('T')[0],
				categoryId: ''
			}
		];
	}

	// Get total amount for multi-expense form
	function getTotalAmount(): number {
		return multiExpenseData.expenses.reduce((total, expense) => {
			const amount = parseFloat(expense.amount) || 0;
			return total + amount;
		}, 0);
	}

	// Check if multi-expense form has valid data
	function hasValidExpenses(): boolean {
		return multiExpenseData.expenses.some(
			(expense) => expense.name.trim() && expense.amount && parseFloat(expense.amount) > 0
		);
	}
</script>

<svelte:head>
	<title>Expenses - Monetary</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-base-content">Expenses</h1>
		<div class="flex gap-2">
			<button class="btn btn-outline" onclick={openCategoryModal}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 7h6l2 2h10v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
					/>
				</svg>
				Create Category
			</button>
			<button class="btn btn-primary" onclick={openModal}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Add Expenses
			</button>
		</div>
	</div>

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
												<span
													class="badge badge-lg"
													style="background-color: {getCategoryById(expense.categoryId)
														?.color}; color: {getCategoryById(expense.categoryId)?.textColor}"
												>
													{getCategoryById(expense.categoryId)?.name}
												</span>
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
					<button class="btn btn-lg btn-primary" onclick={openModal}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add Your First Expenses
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && expenseToDelete}
	<div class="modal-open modal">
		<div class="modal-box">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-2xl font-bold text-base-content">Delete Expense</h3>
				<button
					class="btn btn-circle btn-ghost btn-sm"
					onclick={closeDeleteModal}
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="mb-6">
				<p class="mb-4 text-base-content/80">
					Are you sure you want to delete this expense? This action cannot be undone.
				</p>

				<div class="rounded-lg bg-base-200 p-4">
					<div class="flex items-center justify-between">
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
							<span class="loading loading-sm loading-spinner"></span>
							Deleting...
						{:else}
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
	<div class="modal-open modal">
		<div class="modal-box">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-2xl font-bold text-base-content">Edit Expense</h3>
				<button
					class="btn btn-circle btn-ghost btn-sm"
					onclick={closeEditModal}
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
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
						class="input-bordered input w-full"
						placeholder="e.g., Groceries, Gas"
						bind:value={formData.name}
						required
						disabled={isSubmitting}
					/>
					<div class="label">
						<span class="label-text-alt text-base-content/60"
							>Enter a descriptive name for this expense</span
						>
					</div>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="edit-amount">
						<span class="label-text font-semibold">Amount</span>
					</label>
					<div class="relative">
						<span
							class="absolute top-1/2 left-3 z-10 -translate-y-1/2 transform text-base-content/60"
							>₴</span
						>
						<input
							type="number"
							id="edit-amount"
							name="amount"
							class="input-bordered input w-full pl-8"
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
						class="input-bordered input w-full"
						bind:value={formData.date}
						required
						disabled={isSubmitting}
					/>
					<div class="label">
						<span class="label-text-alt text-base-content/60"
							>Select the date when this expense occurred</span
						>
					</div>
				</div>

				<!-- Category selector -->
				<div class="form-control mb-6">
					<label class="label" for="edit-category">
						<span class="label-text font-semibold">Category</span>
					</label>
					<select
						id="edit-category"
						name="categoryId"
						class="select-bordered select w-full overflow-y-auto [&::picker(select)]:max-h-48"
						bind:value={formData.categoryId}
						disabled={isSubmitting}
					>
						<option value="">Uncategorized</option>
						{#each data.categories as category (category.id)}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div class="modal-action">
					<button
						class="btn btn-ghost"
						type="button"
						onclick={closeEditModal}
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button class="btn btn-primary" type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<span class="loading loading-sm loading-spinner"></span>
							Updating...
						{:else}
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
							Update Expense
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Add Multiple Expenses Modal -->
{#if showModal}
	<div class="modal-open modal">
		<div class="modal-box max-w-4xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-2xl font-bold text-base-content">Add Multiple Expenses</h3>
				<button
					class="btn btn-circle btn-ghost btn-sm"
					onclick={closeModal}
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form use:enhance={handleSuccess} action="?/createMultipleExpenses" method="post">
				<div class="mb-6">
					<div class="mb-4 flex items-center justify-between">
						<p class="text-base-content/80">
							Add multiple expenses at once. You can add or remove rows as needed.
						</p>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline btn-sm" onclick={addExpenseRow}>
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
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Add Row
							</button>
							<button type="button" class="btn btn-ghost btn-sm" onclick={clearAllExpenses}>
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
								Clear All
							</button>
						</div>
					</div>

					<!-- Expense rows -->
					<div class="max-h-96 space-y-4 overflow-y-auto">
						{#each multiExpenseData.expenses as expense, index (expense.id)}
							<div class="card bg-base-200 p-4">
								<div class="mb-3 flex items-center justify-between">
									<h4 class="font-semibold text-base-content">Expense #{index + 1}</h4>
									{#if multiExpenseData.expenses.length > 1}
										<button
											type="button"
											class="btn text-error btn-ghost btn-sm"
											onclick={() => removeExpenseRow(index)}
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
											Remove
										</button>
									{/if}
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
									<div class="form-control">
										<label class="label" for="name-{index}">
											<span class="label-text font-semibold">Name</span>
										</label>
										<input
											type="text"
											id="name-{index}"
											name="expenses[{index}][name]"
											class="input-bordered input w-full"
											placeholder="e.g., Groceries, Gas"
											bind:value={expense.name}
											disabled={isSubmitting}
										/>
									</div>

									<div class="form-control">
										<label class="label" for="amount-{index}">
											<span class="label-text font-semibold">Amount</span>
										</label>
										<div class="relative">
											<span
												class="absolute top-1/2 left-3 z-10 -translate-y-1/2 transform text-base-content/60"
												>₴</span
											>
											<input
												type="number"
												id="amount-{index}"
												name="expenses[{index}][amount]"
												class="input-bordered input w-full pl-8"
												placeholder="0.00"
												step="0.01"
												min="0"
												bind:value={expense.amount}
												disabled={isSubmitting}
											/>
										</div>
									</div>

									<div class="form-control">
										<label class="label" for="date-{index}">
											<span class="label-text font-semibold">Date</span>
										</label>
										<input
											type="date"
											id="date-{index}"
											name="expenses[{index}][date]"
											class="input-bordered input w-full"
											bind:value={expense.date}
											disabled={isSubmitting}
										/>
									</div>

									<div class="form-control">
										<label class="label" for="category-{index}">
											<span class="label-text font-semibold">Category</span>
										</label>
										<select
											id="category-{index}"
											name="expenses[{index}][categoryId]"
											class="select-bordered select w-full overflow-y-auto [&::picker(select)]:!max-h-48"
											bind:value={expense.categoryId}
											disabled={isSubmitting}
										>
											<option value="">Uncategorized</option>
											{#each data.categories as category (category.id)}
												<option value={category.id}>{category.name}</option>
											{/each}
										</select>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Total summary -->
					{#if getTotalAmount() > 0}
						<div class="mt-4 rounded-lg bg-primary/10 p-4">
							<div class="flex items-center justify-between">
								<span class="font-semibold text-base-content">Total Amount:</span>
								<span class="text-lg font-bold text-primary">
									{formatAmount(Math.round(getTotalAmount() * 100))}
								</span>
							</div>
							<div class="mt-1 text-sm text-base-content/70">
								{multiExpenseData.expenses.length} expense{multiExpenseData.expenses.length === 1
									? ''
									: 's'}
							</div>
						</div>
					{/if}
				</div>

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={closeModal} disabled={isSubmitting}>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={isSubmitting || !hasValidExpenses()}
					>
						{#if isSubmitting}
							<span class="loading loading-sm loading-spinner"></span>
							Adding Expenses...
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Add {multiExpenseData.expenses.length} Expense{multiExpenseData.expenses.length === 1
								? ''
								: 's'}
						{/if}
					</button>
				</div>
			</form>
		</div>
		<div
			class="modal-backdrop"
			onclick={closeModal}
			onkeydown={(e) => e.key === 'Escape' && closeModal()}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		></div>
	</div>
{/if}

<!-- Create Category Modal -->
{#if showCategoryModal}
	<div class="modal-open modal">
		<div class="modal-box">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-2xl font-bold text-base-content">Create Category</h3>
				<button
					class="btn btn-circle btn-ghost btn-sm"
					onclick={closeCategoryModal}
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form use:enhance={handleCategorySuccess} action="?/createCategory" method="post">
				<div class="form-control mb-4">
					<label class="label" for="category-name">
						<span class="label-text font-semibold">Name</span>
					</label>
					<input
						type="text"
						id="category-name"
						name="name"
						class="input-bordered input w-full"
						placeholder="e.g., Groceries, Transport"
						bind:value={categoryForm.name}
						required
						disabled={isSubmitting}
					/>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="category-color">
						<span class="label-text font-semibold">Color</span>
					</label>
					<input
						type="color"
						id="category-color"
						name="color"
						class="input w-24 p-0"
						bind:value={categoryForm.color}
						required
						disabled={isSubmitting}
					/>
				</div>

				<div class="form-control mb-6">
					<label class="label" for="category-text-color">
						<span class="label-text font-semibold">Text Color</span>
					</label>
					<input
						type="color"
						id="category-text-color"
						name="textColor"
						class="input w-24 p-0"
						bind:value={categoryForm.textColor}
						required
						disabled={isSubmitting}
					/>
				</div>

				<div class="modal-action">
					<button
						type="button"
						class="btn btn-ghost"
						onclick={closeCategoryModal}
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						class="btn btn-primary"
						type="submit"
						disabled={isSubmitting || !categoryForm.name.trim()}
					>
						{#if isSubmitting}
							<span class="loading loading-sm loading-spinner"></span>
							Creating...
						{:else}
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
									d="M3 7h6l2 2h10v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
								/>
							</svg>
							Create Category
						{/if}
					</button>
				</div>
			</form>
		</div>
		<div
			class="modal-backdrop"
			onclick={closeCategoryModal}
			onkeydown={(e) => e.key === 'Escape' && closeCategoryModal()}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		></div>
	</div>
{/if}
