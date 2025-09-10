<script lang="ts">
	import { enhance } from '$app/forms';

	interface Expense {
		id: string;
		name: string;
		amountCents: number;
		date: Date;
	}

	interface Props {
		show: boolean;
		expense: Expense | null;
		isSubmitting: boolean;
		onClose: () => void;
		onSuccess: () => void;
	}

	let { show, expense, isSubmitting, onClose, onSuccess }: Props = $props();

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
</script>

{#if show && expense}
	<div class="modal-open modal">
		<div class="modal-box">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-2xl font-bold text-base-content">Delete Expense</h3>
				<button
					class="btn btn-circle btn-ghost btn-sm"
					onclick={onClose}
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
							<h4 class="font-semibold text-base-content">{expense.name}</h4>
							<p class="text-sm text-base-content/70">{formatDate(expense.date)}</p>
						</div>
						<div class="text-right">
							<span class="badge badge-outline badge-lg">
								{formatAmount(expense.amountCents)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={onClose} disabled={isSubmitting}>
					Cancel
				</button>
				<form use:enhance={onSuccess} action="?/deleteExpense" method="post">
					<input type="hidden" name="expenseId" value={expense.id} />
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
