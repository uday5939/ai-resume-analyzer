import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("upload", "routes/upload.tsx"),
  route("api/analyze", "routes/api.analyze.ts"),
  route("resume/:id", "routes/resume.tsx"),
] satisfies RouteConfig;