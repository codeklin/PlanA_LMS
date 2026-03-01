# Cohort Management Guide

## Overview
Instructors and admins can now create and manage cohorts through the admin panel.

## Accessing Cohort Management

### For Instructors:
1. Login with your instructor account
2. You'll be redirected to `/admin` (admin dashboard)
3. Click on "Cohorts" in the sidebar
4. Or navigate directly to `/admin/cohorts`

### For Admins/Super Admins:
1. Login with your admin account
2. Navigate to `/admin/cohorts`

## Creating a Cohort

### Step 1: Click "Create Cohort"
Click the orange "Create Cohort" button in the top right corner.

### Step 2: Fill in Required Information

**Basic Information:**
- **Cohort Name*** (Required): e.g., "Web Development Cohort 2024"
- **Description**: Brief description of the cohort
- **Start Date*** (Required): When the cohort begins
- **End Date*** (Required): When the cohort ends

**Settings:**
- **Status**: 
  - `Upcoming` - Not yet started
  - `Active` - Currently running
  - `Completed` - Finished
  - `Archived` - Archived for reference
- **Max Learners**: Maximum number of students (default: 30)

**Performance Settings:**
- **Performance Threshold**: Minimum passing percentage (default: 70%)
- **Weekly Target**: Expected learning hours per week (default: 10 hours)
- **Grace Period**: Days allowed for late submissions (default: 3 days)
- **Review Cycle**: How often to review progress
  - Weekly
  - Bi-weekly
  - Monthly

### Step 3: Click "Create Cohort"
Your cohort will be created and appear in the list.

## Managing Cohorts

### Edit a Cohort
1. Find the cohort card
2. Click the "Edit" button
3. Update the information
4. Click "Update Cohort"

### Delete a Cohort
1. Find the cohort card
2. Click the trash icon (🗑️)
3. Confirm deletion
4. **Warning**: This action cannot be undone!

## Cohort Status Colors

- 🔵 **Blue** - Upcoming
- 🟢 **Green** - Active
- ⚫ **Gray** - Completed
- ⚪ **Slate** - Archived

## Permissions

### Who Can Create Cohorts?
- ✅ Super Admins
- ✅ Admins
- ✅ Instructors
- ❌ Learners

### Who Can Edit/Delete Cohorts?
- ✅ Super Admins (all cohorts)
- ✅ Admins (all cohorts)
- ✅ Instructors (all cohorts)

## Best Practices

### Naming Cohorts
Use clear, descriptive names:
- ✅ "Web Development Cohort - Q1 2024"
- ✅ "Data Science Bootcamp - March 2024"
- ❌ "Cohort 1"
- ❌ "Test"

### Setting Dates
- Ensure end date is after start date
- Consider holidays and breaks
- Allow buffer time for final projects

### Performance Settings
- **70% threshold** is standard for most programs
- **10 hours/week** is typical for part-time programs
- **3 days grace period** balances flexibility and accountability

### Status Management
1. Create cohort as "Upcoming"
2. Change to "Active" when it starts
3. Mark as "Completed" when finished
4. Archive old cohorts to keep the list clean

## Troubleshooting

### "Failed to create cohort"
- Check that cohort name is unique
- Ensure start date is before end date
- Verify you're logged in as instructor/admin

### "You don't have permission"
- Verify your role is instructor, admin, or super-admin
- Contact an admin to update your role

### Cohort not appearing
- Refresh the page
- Check if it was created successfully (look for success toast)
- Try logging out and back in

## Database Structure

Cohorts are stored in the `cohorts` table with these fields:
- `id` - Unique identifier
- `name` - Cohort name (must be unique)
- `description` - Optional description
- `start_date` - Start date
- `end_date` - End date
- `status` - Current status
- `performance_threshold` - Passing percentage
- `weekly_target` - Expected hours per week
- `grace_period_days` - Late submission allowance
- `review_cycle_frequency` - Review frequency
- `max_learners` - Maximum students
- `thumbnail_url` - Optional image
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Next Steps

After creating a cohort:
1. Assign courses to the cohort
2. Enroll learners
3. Assign instructors
4. Set up events and deadlines
5. Monitor learner progress

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase connection
3. Ensure database migrations are complete
4. Contact technical support

---

**Note**: This feature requires proper Supabase setup and database migrations. Ensure you've run `supabase-complete-migration.sql` before using cohort management.
