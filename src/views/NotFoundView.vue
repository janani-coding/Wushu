<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 text-center">
    <div class="max-w-md w-full glass-panel p-10 rounded-3xl border border-slate-800 space-y-6">
      <h1 class="font-heading text-7xl font-extrabold text-amber-400">404</h1>
      <h2 class="text-2xl font-bold text-slate-100">Page Not Found</h2>
      <p class="text-xs text-slate-400 leading-relaxed">
        The warrior stance or page you are attempting to reach does not exist or has been moved.
      </p>
      <router-link 
        to="/"
        class="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
      >
        Return to Home Page
      </router-link>
    </div>
  </div>
</template>
