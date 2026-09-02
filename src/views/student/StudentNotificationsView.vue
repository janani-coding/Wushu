<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-28 sm:pb-12">
    <div>
      <h1 class="font-heading text-2xl font-extrabold text-slate-100">Academy Announcements & Notifications</h1>
      <p class="text-xs text-slate-400">Broadcasted announcements from academy grandmasters and administrators.</p>
    </div>

    <!-- Notifications List -->
    <div v-if="notificationStore.notifications.length" class="space-y-4">
      <div 
        v-for="n in notificationStore.notifications" 
        :key="n.id"
        class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {{ n.type }}
          </span>
          <span class="text-[10px] text-slate-500">{{ new Date(n.date).toLocaleString() }}</span>
        </div>
        <h3 class="text-base font-bold text-slate-100">{{ n.title }}</h3>
        <p class="text-xs text-slate-300 leading-relaxed">{{ n.message }}</p>
        <p class="text-[10px] text-slate-500 pt-1">Issued by {{ n.sentBy }}</p>
      </div>
    </div>

    <div v-else class="py-16 text-center text-xs text-slate-500 glass-panel rounded-3xl border border-slate-800">
      No broadcasted announcements.
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>
