# Firestore Composite Indexes Required

This document lists all the composite indexes required for the application to work properly.

## Tasks Collection

### Index 1: Tasks Query (Active Tasks)
**Collection:** `tasks`
**Fields:**
- `projectId` (Ascending)
- `isDeleted` (Ascending)
- `order` (Ascending)
- `createdAt` (Descending)

**Usage:** Used in `fetchTasks()` and `subscribeToTasks()` to get active (non-deleted) tasks

**Create via Firebase Console:**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Collection ID: `tasks`
4. Add fields:
   - `projectId` → Ascending
   - `isDeleted` → Ascending
   - `order` → Ascending
   - `createdAt` → Descending
5. Query scope: Collection

---

### Index 2: Trashed Tasks Query
**Collection:** `tasks`
**Fields:**
- `projectId` (Ascending)
- `isDeleted` (Ascending)

**Usage:** Used in `fetchTrashedTasks()` to get deleted/trashed tasks

**Note:** This is a simple composite index and might be automatically created by Firestore. If you get an error, the console will provide a direct link to create it.

---

## Alternative: firestore.indexes.json

You can also create a `firestore.indexes.json` file for Firebase CLI deployment:

```json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isDeleted",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "order",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isDeleted",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

To deploy:
```bash
firebase deploy --only firestore:indexes
```

---

## Notes

- When you run a query that needs an index, Firestore will show an error with a direct link to create the index
- Index creation can take a few minutes depending on your data size
- The current code filters `isDeleted` in JavaScript to avoid requiring the first complex index initially
- For better performance in production, consider using the full composite index

---

## Current Implementation

The code currently uses these strategies to minimize index requirements:

1. **Active Tasks:** Filters `isDeleted !== true` in JavaScript after fetching
2. **Trashed Tasks:** Uses simple query without orderBy, sorts in JavaScript
3. **Performance:** Acceptable for small to medium datasets, consider adding full indexes for production

If you want optimal performance, create both indexes listed above.
