import {
  Blocks,
  BotMessageSquare,
  Brain,
  BrainCircuit,
  Cable,
  CodeXml,
  GitPullRequestArrow,
  Home,
  ListTodo,
  Network,
  Puzzle,
  ReplaceAll,
  Settings2,
  ShieldCheck,
  SquareChartGantt,
  User,
  Waypoints,
  Workflow,
  WorkflowIcon,
} from "lucide-react";
export const cardItemsForLeft = [
  {
    id: 1,
    image: GitPullRequestArrow,
    title: "Pull Request",
    content: "Opened",
  },
  {
    id: 2,
    image: ReplaceAll,
    title: "Code Changes",
    content: "detected",
  },
  {
    id: 3,
    image: ListTodo,
    title: "CI / Checks",
    content: "completed",
  },
];
export const cardItemsForRight = [
  {
    id: 1,
    image: BotMessageSquare,
    title: "AI Review",
    content: "Smart Suggestion",
  },
  {
    id: 2,
    image: Waypoints,
    title: "Auto Actions",
    content: "Label, Assign, Merge",
  },
  {
    id: 3,
    image: CodeXml,
    title: "Better Code",
    content: "Higher quality",
  },
];
export const footeritems = [
  {
    id: 1,
    title: "AI Powered Reviews",
    image: <Brain />,
    content: "Get intellegent ,context-aware review comments",
  },
  {
    id: 2,
    title: "Smart Automation",
    image: <User />,
    content: "Automate labels,assigments,and merges",
  },
  {
    id: 3,
    title: "Easy Intefration",
    image: <Cable />,
    content: "Works seamlessly with your existing Github Workflows",
  },
  {
    id: 4,
    title: "Secure & Private",
    image: <ShieldCheck />,
    content: "Your code is safe with us we respect your privacy",
  },
];

export const cardItems = [
  {
    id: 1,
    title: "AI Code Reviews",
    image: <SquareChartGantt />,
    content: "intellegent suggestion",
  },
  {
    id: 2,
    title: "Workflow Automation",
    image: <Workflow />,
    content: "trigger action & save time",
  },
  {
    id: 3,
    title: "Seamless Integration",
    image: <Blocks />,
    content: "Built for GitHub",
  },
];
export const navitems = [
  { page: "Home", href: "/" },
  { page: "Features", href: "/home" },
  { page: "How it works", href: "/home" },
  { page: "About", href: "/about" },
  { page: "Pricing", href: "/home" },
];

export const sidbarNavItems = [
  { id: 1, page: "Dashboard", href: "/dashboard", icon: Home },
  { id: 2, page: "Workflows", href: "/home", icon: WorkflowIcon },
  { id: 3, page: "Repositories", href: "/repos", icon: Network },
  { id: 4, page: "AI Review", href: "/about", icon: BrainCircuit },
  { id: 5, page: "Integration", href: "/home", icon: Puzzle },
  { id: 6, page: "Settings", href: "/home", icon: Settings2 },
];
