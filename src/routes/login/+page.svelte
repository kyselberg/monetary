<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="text-center mb-6">
				<h1 class="text-3xl font-bold text-base-content">Welcome</h1>
				<p class="text-base-content/70 mt-2">Sign in to your account or create a new one</p>
			</div>

			{#if form?.message}
				<div class="alert alert-error mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{form.message}</span>
				</div>
			{/if}

			<form method="post" action="?/login" use:enhance class="space-y-4">
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text font-medium">Username</span>
					</label>
					<input
						id="username"
						name="username"
						type="text"
						placeholder="Enter your username"
						class="input input-bordered w-full focus:input-primary"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text font-medium">Password</span>
					</label>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="Enter your password"
						class="input input-bordered w-full focus:input-primary"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary w-full">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
						</svg>
						Sign In
					</button>
				</div>

				<div class="divider">OR</div>

				<div class="form-control">
					<button
						type="submit"
						formaction="?/register"
						class="btn btn-outline btn-primary w-full"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
						</svg>
						Create Account
					</button>
				</div>
			</form>

			<div class="text-center mt-6">
				<p class="text-sm text-base-content/60">
					By signing in, you agree to our terms of service and privacy policy.
				</p>
			</div>
		</div>
	</div>
</div>
