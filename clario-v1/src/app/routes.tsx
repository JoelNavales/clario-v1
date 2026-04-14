import type { RouteObject } from "react-router-dom";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import MoodPage from "../features/mood/pages/MoodPage";
import HabitsPage from "../features/habits/pages/HabitsPage";
import TasksPage from "../features/tasks/pages/TasksPage";
import InsightsPage from "../features/insights/pages/InsightsPage";
import SettingsPage from "../features/settings/pages/SettingsPage";

export const routes: RouteObject[] = [
  { path: "/", element: <DashboardPage /> },
  { path: "/mood", element: <MoodPage /> },
  { path: "/habits", element: <HabitsPage /> },
  { path: "/tasks", element: <TasksPage /> },
  { path: "/insights", element: <InsightsPage /> },
  { path: "/settings", element: <SettingsPage /> },
];
