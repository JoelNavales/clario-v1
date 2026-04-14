import type { RouteObject } from "react-router-dom";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import MoodPage from "../features/mood/pages/MoodPage";
import HabitsPage from "../features/habits/pages/HabitsPage";
import TasksPage from "../features/tasks/pages/TasksPage";
import InsightsPage from "../features/insights/pages/InsightsPage";
import JournalPage from "../features/insights/pages/JournalPage";
import MantraPage from "../features/insights/pages/MantraPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import OnboardingPage from "../features/onboarding/pages/OnboardingPage";

export const routes: RouteObject[] = [
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/", element: <DashboardPage /> },
  { path: "/mood", element: <MoodPage /> },
  { path: "/habits", element: <HabitsPage /> },
  { path: "/tasks", element: <TasksPage /> },
  { path: "/insights", element: <InsightsPage /> },
  { path: "/insights/journal", element: <JournalPage /> },
  { path: "/insights/mantra", element: <MantraPage /> },
  { path: "/settings", element: <SettingsPage /> },
];
