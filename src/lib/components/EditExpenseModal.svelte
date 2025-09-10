<script lang="ts">
	import { enhance } from '$app/forms';

	interface Expense {
		id: string;
		name: string;
		amountCents: number;
		date: Date;
		categoryId?: string | null;
	}

	interface Category {
		id: string;
		name: string;
		color: string | null;
		textColor: string | null;
	}

	interface FormData {
		name: string;
		amount: string;
		date: string;
		categoryId: string;
	}

	interface Props {
		show: boolean;
		expense: Expense | null;
		formData: FormData;
		categories: Category[];
		isSubmitting: boolean;
		onClose: () => void;
		onSuccess: () => void;
		onFormDataChange: (data: FormData) => void;
	}

	let {
		show,
		expense,
		formData,
		categories,
		isSubmitting,
		onClose,
		onSuccess,
		onFormDataChange
	}: Props = $props();

	// Update form data when expense changes
	$effect(() => {
		if (expense) {
			const newFormData = {
				name: expense.name,
				amount: (expense.amountCents / 100).toFixed(2),
				date: expense.date.toISOString().split('T')[0],
				categoryId: expense.categoryId ?? ''
			};
			onFormDataChange(newFormData);
		}
	});
</script>

{#if show && expense}
	<div class="modal-open modal">
		<div class="modal-box">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-2xl font-bold text-base-content">Edit Expense</h3>
				<button class="btn btn-circle btn-ghost btn-sm" onclick={onClose} aria-label="Close modal">
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

			<form use:enhance={onSuccess} action="?/updateExpense" method="post">
				<input type="hidden" name="expenseId" value={expense.id} />

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
						{#each categories as category (category.id)}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div class="modal-action">
					<button class="btn btn-ghost" type="button" onclick={onClose} disabled={isSubmitting}>
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
