# Frontend API Integration

## API Client

`src/services/api.js` creates one Axios client for the full app.

- `baseURL` reads `VITE_API_BASE_URL` and falls back to `http://localhost:5000/api/v1`.
- `withCredentials` allows the backend to use secure HTTP-only cookies.
- The request interceptor reads `kelvin_admin_token` from `localStorage` and sends it as `Authorization: Bearer <token>`.
- The response interceptor clears stale tokens on `401` and broadcasts `kelvin:auth-expired`.

## Service Layer

The UI calls service files instead of calling Axios directly.

- `authService.js` handles login, logout, and current admin profile.
- `productService.js` handles product list, featured products, and product details.
- `blogService.js` handles blog list and single blog page data.
- `inquiryService.js` handles contact, request quote, and newsletter submissions.
- `dashboardService.js` handles summary cards, charts, latest inquiries, recent blogs, featured products, and visitor analytics.

## Authentication

`AuthContext.jsx` stores the current admin in React state.

- On app startup, it checks for an existing JWT.
- If a token exists, it calls `/auth/me`.
- `login()` calls `/auth/login`, stores the token, and saves the admin profile.
- `logout()` calls `/auth/logout`, removes the token, and clears the admin profile.

## Protected Routes

`ProtectedRoute.jsx` blocks admin pages unless the admin is authenticated.

- While `/auth/me` is loading, it renders skeleton UI.
- If the admin is missing, it redirects to `/admin/login`.
- If authenticated, it renders the nested admin route through `<Outlet />`.

## Public Pages

- `ProductsSection.jsx` fetches `/products` with search, featured filter, page, and limit.
- `BlogSection.jsx` fetches `/blogs` and falls back to local blog data if the API is unavailable.
- `BlogDetailPage.jsx` fetches `/blogs/:slug` and supports API string content or local paragraph arrays.
- `ContactPage.jsx` posts to `/inquiries/contact` or `/inquiries/request-quote` depending on the route.

## Admin Dashboard

`AdminDashboardPage.jsx` loads all dashboard APIs in parallel.

- Summary cards show products, blogs, inquiries, and categories.
- The monthly inquiry chart uses CSS bars, so no chart package is needed.
- Latest inquiries, recent blogs, featured products, and visitor analytics render from backend dashboard endpoints.

## Loading And Errors

- `Skeleton.jsx` provides reusable loading placeholders.
- `ErrorBoundary.jsx` catches rendering errors and shows a clean fallback.
- `ToastContext.jsx` provides global success, error, and info notifications.

## Performance

- Admin pages and heavier public pages are lazy-loaded with `React.lazy`.
- `Suspense` provides a consistent loading shell.
- Images use `loading="lazy"`.
- API calls use narrow service methods and dashboard calls run with `Promise.all`.
- No extra chart or toast packages were added, keeping the bundle smaller.

## Environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For production on Vercel, set `VITE_API_BASE_URL` to the Render backend URL, for example:

```env
VITE_API_BASE_URL=https://kelvin-api.onrender.com/api/v1
```
