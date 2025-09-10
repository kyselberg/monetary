<script lang="ts">
	import { nanoid } from 'nanoid';
	import type { PageData } from '../../routes/(app)/$types';

	let { data, preselectedCategoryId }: { data: PageData; preselectedCategoryId?: string } =
		$props();

	let showPopover = $state(false);
	let popoverRef: HTMLDivElement;

	let showModal = $state(false);
	let showCategoryModal = $state(false);
	let isSubmitting = $state(false);

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

	let categoryForm = $state({
		name: '',
		color: '#000000',
		textColor: '#ffffff',
		description: ''
	});

	function togglePopover() {
		showPopover = !showPopover;
	}

	function closePopover() {
		showPopover = false;
	}

	function handleAddExpense() {
		closePopover();
		openModal();
	}

	function handleAddCategory() {
		closePopover();
		openCategoryModal();
	}

	function openModal() {
		showModal = true;
		multiExpenseData = {
			expenses: [
				{
					id: nanoid(),
					name: '',
					amount: '',
					date: new Date().toISOString().split('T')[0],
					categoryId: preselectedCategoryId || ''
				}
			]
		};
	}

	function closeModal() {
		showModal = false;
	}

	function openCategoryModal() {
		showCategoryModal = true;
		categoryForm = { name: '', color: '#000000', textColor: '#ffffff', description: '' };
	}

	function closeCategoryModal() {
		showCategoryModal = false;
	}

	// API call functions
	async function createCategory() {
		if (!categoryForm.name.trim() || !categoryForm.description.trim()) {
			return;
		}

		isSubmitting = true;
		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: categoryForm.name.trim(),
					description: categoryForm.description.trim(),
					color: categoryForm.color,
					textColor: categoryForm.textColor
				})
			});

			if (response.ok) {
				closeCategoryModal();
				window.location.reload();
			} else {
				const error = await response.json();
				console.error('Error creating category:', error);
				alert('Failed to create category. Please try again.');
			}
		} catch (error) {
			console.error('Error creating category:', error);
			alert('Failed to create category. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	async function createMultipleExpenses() {
		if (!hasValidExpenses()) {
			return;
		}

		isSubmitting = true;
		try {
			const expenses = multiExpenseData.expenses
				.filter(
					(expense) => expense.name.trim() && expense.amount && parseFloat(expense.amount) > 0
				)
				.map((expense) => ({
					name: expense.name.trim(),
					amount: parseFloat(expense.amount),
					date: expense.date,
					categoryId: expense.categoryId || null
				}));

			const response = await fetch('/api/expenses', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ expenses })
			});

			if (response.ok) {
				closeModal();
				window.location.reload();
			} else {
				const error = await response.json();
				console.error('Error creating expenses:', error);
				alert('Failed to create expenses. Please try again.');
			}
		} catch (error) {
			console.error('Error creating expenses:', error);
			alert('Failed to create expenses. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	function addExpenseRow() {
		multiExpenseData.expenses.push({
			id: nanoid(),
			name: '',
			amount: '',
			date: new Date().toISOString().split('T')[0],
			categoryId: preselectedCategoryId || ''
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
				categoryId: preselectedCategoryId || ''
			}
		];
	}

	function getTotalAmount(): number {
		return multiExpenseData.expenses.reduce((total, expense) => {
			const amount = parseFloat(expense.amount) || 0;
			return total + amount;
		}, 0);
	}

	function hasValidExpenses(): boolean {
		return multiExpenseData.expenses.some(
			(expense) => expense.name.trim() && expense.amount && parseFloat(expense.amount) > 0
		);
	}

	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				closePopover();
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<div class="fixed right-6 bottom-6 z-50" use:clickOutside>
	<div class="relative" bind:this={popoverRef}>
		{#if showPopover}
			<div
				class="absolute right-0 bottom-16 mb-2 w-48 rounded-lg border border-base-300 bg-base-100 p-2 shadow-xl"
			>
				<div class="space-y-1">
					<button
						class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-200"
						onclick={handleAddExpense}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-primary"
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
						<span class="font-medium text-base-content">Add Expense</span>
					</button>
					<button
						class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-200"
						onclick={handleAddCategory}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-secondary"
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
						<span class="font-medium text-base-content">Add Category</span>
					</button>
				</div>
			</div>
		{/if}

		<!-- Floating Action Button -->
		<button
			class="btn btn-circle shadow-lg transition-all duration-200 btn-lg btn-primary hover:scale-105 hover:shadow-xl"
			onclick={togglePopover}
			aria-label="Add new item"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>
</div>

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
								{new Intl.NumberFormat('uk-UA', {
									style: 'currency',
									currency: 'UAH'
								}).format(Math.round(getTotalAmount() * 100) / 100)}
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
					type="button"
					class="btn btn-primary"
					onclick={createMultipleExpenses}
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

			<div class="form-control mb-4">
				<label class="label" for="category-name">
					<span class="label-text font-semibold">Name</span>
				</label>
				<input
					type="text"
					id="category-name"
					class="input-bordered input w-full"
					placeholder="e.g., Groceries, Transport"
					bind:value={categoryForm.name}
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="form-control mb-4">
				<label class="label" for="category-description">
					<span class="label-text font-semibold">Description</span>
				</label>
				<textarea
					id="category-description"
					class="textarea-bordered textarea w-full"
					placeholder="Describe what this category is for..."
					bind:value={categoryForm.description}
					required
					disabled={isSubmitting}
					rows="3"
				></textarea>
			</div>

			<div class="form-control mb-4">
				<label class="label" for="category-color">
					<span class="label-text font-semibold">Color</span>
				</label>
				<input
					type="color"
					id="category-color"
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
					type="button"
					class="btn btn-primary"
					onclick={createCategory}
					disabled={isSubmitting || !categoryForm.name.trim() || !categoryForm.description.trim()}
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
