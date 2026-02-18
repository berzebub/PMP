const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'checkins', component: () => import('pages/CheckinPage.vue') },
      { path: 'worklogs', component: () => import('pages/WorklogPage.vue') },
      { path: 'portfolio', component: () => import('pages/PortfolioPage.vue') },
      { path: 'leaves', component: () => import('pages/LeavePage.vue') },
      { path: 'leave-report', component: () => import('pages/LeaveReportPage.vue') },
      { path: 'expense-report', component: () => import('pages/ExpenseReportPage.vue') },
      { path: 'expenses', component: () => import('pages/ExpensePage.vue') },
      { path: 'calendar', component: () => import('pages/CalendarPage.vue') },
      { path: 'meeting-room', component: () => import('pages/MeetingRoomPage.vue') },
      { path: 'admin', component: () => import('pages/AdminPage.vue') },
      { path: 'attendance', component: () => import('pages/AttendancePage.vue') },
      { path: 'project/:id', component: () => import('pages/ProjectPage.vue') },
      { path: 'project/:id/settings', component: () => import('pages/ProjectSettingsPage.vue') },
      { path: 'project/:id/trash', component: () => import('pages/TrashPage.vue') },
      { path: 'games', component: () => import('pages/GamesPage.vue') },
      { path: 'games/dino-runner', component: () => import('pages/DinoRunnerPage.vue') },
      { path: 'games/hallway-herding', component: () => import('pages/HallwayHerdingPage.vue') },
      { path: 'games/stack-overflow', component: () => import('pages/StackOverflowPage.vue') },
      { path: 'games/werewolf', component: () => import('pages/WerewolfPage.vue') },
      { path: 'games/uno', component: () => import('pages/UnoPage.vue') },
      { path: 'games/vocab-battle', component: () => import('pages/VocabBattlePage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
