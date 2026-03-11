# Skeleton Loading Pattern

## Overview

Skeleton screens improve perceived performance by showing a placeholder UI while content loads. This creates a smoother user experience when navigating between pages.

## Benefits

✅ **Instant Feedback** - Users see immediate visual response when clicking navigation  
✅ **Perceived Performance** - App feels faster even if data loading takes time  
✅ **Better UX** - No blank screens or jarring content shifts  
✅ **Automatic** - Next.js handles loading states automatically

## Implementation

### 1. Base Component (`skeleton.tsx`)

```typescript
import { Skeleton } from "@/components/ui/skeleton"

// Usage
<Skeleton className="h-4 w-[250px]" />
```

### 2. Composite Skeletons (`components/skeletons/`)

#### TableSkeleton

For data tables with filters and pagination:

```typescript
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

<TableSkeleton
  columns={6}      // Number of columns
  rows={10}        // Number of rows
  showActions={true} // Show actions column
/>
```

#### DashboardSkeleton

For dashboard with stats cards and charts:

```typescript
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"

<DashboardSkeleton />
```

### 3. Route Loading (`loading.tsx`)

Next.js automatically shows `loading.tsx` while the page is loading:

```
app/
  dashboard/
    page.tsx          # Main page
    loading.tsx       # Loading state (automatic)
    users/
      page.tsx
      loading.tsx
    students/
      page.tsx
      loading.tsx
```

**Example** - `app/dashboard/users/loading.tsx`:

```typescript
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

export default function UsersLoading() {
  return (
    <div className="container mx-auto py-6">
      <TableSkeleton columns={6} rows={10} />
    </div>
  )
}
```

## How It Works

1. **User clicks navigation** → Instant skeleton appears
2. **Server fetches data** → Loading state shows (can take 1-3 seconds)
3. **Data arrives** → Skeleton smoothly transitions to real content

### Without Skeleton

```
Click → [Blank Screen 2s] → Content appears
❌ Bad UX - looks broken
```

### With Skeleton

```
Click → [Skeleton appears instantly] → Content appears
✅ Good UX - feels responsive
```

## Custom Skeletons

### Create New Skeleton

```typescript
// components/skeletons/my-custom-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton"

export function MyCustomSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[300px]" />
      <Skeleton className="h-64 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  )
}
```

### Use in Route

```typescript
// app/my-route/loading.tsx
import { MyCustomSkeleton } from "@/components/skeletons/my-custom-skeleton"

export default function MyRouteLoading() {
  return <MyCustomSkeleton />
}
```

## Best Practices

### ✅ DO

- **Match layout** - Skeleton should look similar to real content
- **Same spacing** - Use same padding/margins as actual page
- **Appropriate sizes** - Match text/image dimensions
- **Keep it simple** - Don't over-complicate skeleton design

### ❌ DON'T

- **Don't show too much detail** - Basic shapes are enough
- **Don't slow down with animations** - Simple pulse is best
- **Don't forget mobile** - Ensure responsive skeleton
- **Don't reuse loading states poorly** - Different pages may need different skeletons

## File Structure

```
components/
  ui/
    skeleton.tsx              # Base Skeleton component
  skeletons/
    table-skeleton.tsx        # Generic table loading
    dashboard-skeleton.tsx    # Dashboard loading
    [custom]-skeleton.tsx     # Your custom skeletons

app/
  dashboard/
    loading.tsx               # Dashboard loading
    users/
      loading.tsx             # Users page loading
    students/
      loading.tsx             # Students page loading
    products/
      loading.tsx             # Products page loading
    orders/
      loading.tsx             # Orders page loading
```

## Performance Tips

1. **Preload Routes** - Next.js prefetches on hover
2. **Cache Data** - Use React Server Components cache
3. **Optimize Queries** - Fast queries = less skeleton time
4. **Progressive Enhancement** - Show partial data if available

## Troubleshooting

### Skeleton doesn't show

Check:

- `loading.tsx` is at correct route level
- File is named exactly `loading.tsx` (lowercase)
- Component is default export

### Skeleton shows too long

Issue probably with:

- Slow database queries → Add indexes
- Large data fetch → Implement pagination
- No caching → Add cache headers

### Layout shift after loading

Fix by:

- Match skeleton dimensions to real content
- Use fixed heights where possible
- Apply same container classes

## Migration Guide

### Before (No loading state)

```
User clicks → Sees old page → Blank → New page appears
```

### After (With skeleton)

```
User clicks → Sees old page → Instant skeleton → New page appears
```

Just add `loading.tsx` to any route folder!

## Examples

### Table Page

```typescript
// app/dashboard/users/loading.tsx
<TableSkeleton columns={6} rows={10} showActions={true} />
```

### Dashboard Page

```typescript
// app/dashboard/loading.tsx
<DashboardSkeleton />
```

### Custom Layout

```typescript
// app/profile/loading.tsx
<div className="container py-6">
  <Skeleton className="h-12 w-12 rounded-full" />
  <Skeleton className="mt-4 h-8 w-[250px]" />
  <Skeleton className="mt-2 h-4 w-[400px]" />
</div>
```

## Resources

- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Tailwind Animations](https://tailwindcss.com/docs/animation)
