# Next.js 15+ Dynamic Route Parameters Fix Guide

## The Problem
When you get build errors like:
```
Type error: Route has an invalid "DELETE/PUT/POST" export:
Type "{ params: { paramName: string; }; }" is not a valid type
```

## The Solution Pattern

### ✅ WORKING Pattern (Use This):
```typescript
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ paramName: string }> }
) {
  const { paramName } = await context.params;
  // Your code here...
}
```

### ❌ BROKEN Pattern (Avoid):
```typescript
export async function DELETE(
  request: NextRequest,
  context: { params: { paramName: string } }
) {
  const { paramName } = context.params; // No await
  // This causes build errors
}
```

## Quick Fix Steps

1. **Add `Promise<>` wrapper** around your params type:
   ```typescript
   // Change this:
   { params: { orderId: string } }
   
   // To this:
   { params: Promise<{ orderId: string }> }
   ```

2. **Add `await`** when accessing params:
   ```typescript
   // Change this:
   const { orderId } = context.params;
   
   // To this:
   const { orderId } = await context.params;
   ```

## Template for Any Dynamic Route

```typescript
// src/app/api/[folder]/[paramName]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ paramName: string }> }
) {
  const { paramName } = await context.params;
  // Your logic here
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ paramName: string }> }
) {
  const { paramName } = await context.params;
  // Your logic here
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ paramName: string }> }
) {
  const { paramName } = await context.params;
  // Your logic here
}
```

## Common Examples

### User Routes: `[userId]`
```typescript
context: { params: Promise<{ userId: string }> }
const { userId } = await context.params;
```

### Product Routes: `[productId]`
```typescript
context: { params: Promise<{ productId: string }> }
const { productId } = await context.params;
```

### Order Routes: `[orderId]`
```typescript
context: { params: Promise<{ orderId: string }> }
const { orderId } = await context.params;
```

### Multiple Params: `[category]/[productId]`
```typescript
context: { params: Promise<{ category: string; productId: string }> }
const { category, productId } = await context.params;
```

## Troubleshooting

If the fix doesn't work immediately:

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Check file location**: Ensure your file is at:
   ```
   src/app/api/[folder]/[paramName]/route.ts
   ```

3. **Copy from working route**: Use a route that already works as a template

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

## Why This Happens

- Next.js 15+ made dynamic route parameters **asynchronous**
- They're now **Promises** that need to be awaited
- This prevents blocking and improves performance
- Old tutorials/examples use the non-Promise syntax

## Key Takeaway

**Always use**:
- `Promise<{ paramName: string }>` for the type
- `await context.params` to access the values

This pattern works consistently across all Next.js 15+ dynamic routes!