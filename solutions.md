# Budget App Solutions Document

## Supabase Connection Issues

### Initial Connection Problems
1. **Issue**: Failed to connect to Supabase initially
   - Error: Authentication failed with invalid credentials
   - App couldn't establish connection with Supabase backend

2. **Solution**:
   - Double-checked and updated environment variables in `.env.local`
   - Ensured `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were correct
   - Verified we were using the correct project URL from Supabase dashboard
   - Confirmed we were using the anon/public key, not the secret key

## Source Permissions Implementation

### Previous Issues
1. **Problem**: User `ahusamahmed90@gmail.com` could see all sources instead of just "Huvaa"
   - RLS policies weren't properly enforcing permissions
   - Frontend components weren't checking user roles correctly

2. **Initial Attempts That Failed**:
   - Simply enabling RLS on tables wasn't enough
   - Basic RLS policies didn't account for different user roles
   - Frontend components were fetching sources without permission checks

### Successful Solution (December 27, 2024)

1. **Database Level Fixes**:
   ```sql
   -- Created proper role structure
   CREATE TABLE user_roles (
     user_id UUID REFERENCES auth.users,
     role TEXT CHECK (role IN ('viewer', 'controller', 'super_admin')),
     PRIMARY KEY (user_id)
   );

   -- Created source permissions table
   CREATE TABLE source_permissions (
     user_id UUID REFERENCES auth.users,
     source_id UUID REFERENCES sources,
     PRIMARY KEY (user_id, source_id)
   );

   -- Enabled RLS on all tables
   ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;
   ```

2. **RLS Policies Implementation**:
   ```sql
   -- Sources table policy
   CREATE POLICY "Users can view sources they have permission for" ON sources
     FOR SELECT
     USING (
       auth.uid() IN (
         SELECT user_id FROM user_roles WHERE role IN ('controller', 'super_admin')
       ) OR
       id IN (
         SELECT source_id FROM source_permissions WHERE user_id = auth.uid()
       )
     );
   ```

3. **Frontend Changes**:
   - Updated `AppSidebar.tsx` to check user roles and permissions
   - Modified sources query to respect permissions:
     ```typescript
     // First check user's role
     const { data: userRole } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', session.user.id)
       .single();

     // If not a controller/super_admin, only fetch permitted sources
     if (!userRole || !['controller', 'super_admin'].includes(userRole.role)) {
       const { data: permissions } = await supabase
         .from('source_permissions')
         .select('source_id')
         .eq('user_id', session.user.id);

       // Filter sources based on permissions
       query = query.in('id', sourceIds);
     }
     ```

### Result
- User `ahusamahmed90@gmail.com` now only sees the "Huvaa" source
- Controllers and super admins maintain full access to all sources
- Permissions are enforced both at database and application levels

## Source Permissions Management - December 27, 2024

### Problem
- The Manage Sources dialog wasn't properly handling source permissions
- When selecting a source for a user, the app was automatically applying permissions to all sources
- Initial state of selected sources wasn't being properly set when the dialog opened
- Changes weren't being reflected immediately in the UI

### Solution
1. Updated the ManageSourcesDialog component to:
   ```typescript
   // Use useEffect to properly handle initial state
   useEffect(() => {
     setSelectedSources(permissions.map(p => p.source_id));
   }, [permissions]);

   // Initialize selectedSources as empty array
   const [selectedSources, setSelectedSources] = useState<string[]>([]);
   ```

2. Modified the permissions query to be more specific:
   ```typescript
   const { data: permissions = [] } = useQuery({
     queryFn: async () => {
       const { data, error } = await supabase
         .from('source_permissions')
         .select('source_id')  // Only select what we need
         .eq('user_id', userId);
       
       if (error) throw error;
       return data;
     },
   });
   ```

3. Added proper permission flags when creating new permissions:
   ```typescript
   const { error: insertError } = await supabase
     .from('source_permissions')
     .insert(
       selectedSources.map(sourceId => ({
         user_id: userId,
         source_id: sourceId,
         can_view: true,
         can_create: true,
         can_edit: true,
         can_delete: true
       }))
     );
   ```

4. Improved error handling and UI feedback:
   - Added separate error handling for delete and insert operations
   - Close dialog after successful update
   - Show clear success/error messages to users

### Result
- Users can now properly manage source permissions through the dialog
- Source permissions are correctly saved and applied
- The dialog properly shows current permissions when opened
- Changes are immediately reflected in the UI
- Example: user `ahusamahmed90@gmail.com` now only sees the "Huvaa" source as intended
- The Manage Sources button in the user roles table now correctly updates permissions for specific sources

## Authentication and Email Configuration

### Password Reset and Magic Link Implementation (December 27, 2024)

1. **Issue**: Password reset emails weren't being delivered
   - Email configuration wasn't properly set up
   - Redirect URLs weren't correctly configured
   - SMTP settings weren't properly configured for Resend

2. **Solution**:
   - Updated SMTP configuration in Supabase:
     ```
     Host: smtp.resend.com
     Port: 465
     Username: resend
     Sender Email: noreply@logicframeworks.com
     ```
   - Configured proper redirect URLs:
     - https://budget-app-official.lovable.app
     - https://budget-app-official.lovable.app/auth
     - https://budget-app-official.lovable.app/auth/callback

3. **Code Changes**:
   - Updated Supabase client configuration:
     ```typescript
     auth: {
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: true,
       flowType: 'pkce',
       storage: window?.localStorage
     }
     ```
   - Implemented magic link authentication as primary method
   - Added proper error handling and toast notifications

4. **Verification Process**:
   - Tested magic link authentication
   - Verified email delivery from logicframeworks.com domain
   - Confirmed proper redirect handling after authentication

## Key Learnings
1. Always implement security at both database (RLS) and application levels
2. Use proper role-based access control (RBAC) with clearly defined roles
3. Test permissions with different user accounts to verify restrictions
4. Keep track of user roles and permissions in dedicated tables
5. Use Supabase policies to enforce access rules at the database level

## Solutions Management Strategy

To maintain this solutions document effectively:

1. **Entry Format**:
   ```markdown
   ### [Feature/Issue Name] (Date: YYYY-MM-DD)
   
   1. **Issue**:
      - Detailed description of the problem
      - Error messages or symptoms
      - Impact on users/system
   
   2. **Solution**:
      - Step-by-step resolution
      - Configuration changes
      - Code snippets if applicable
   
   3. **Verification**:
      - How the solution was tested
      - Expected behavior
      - Any remaining considerations
   ```

2. **Categories**:
   - Authentication & Authorization
   - Database & Data Management
   - UI/UX Improvements
   - Performance Optimizations
   - Security Updates
   - Bug Fixes

3. **Entry Process**:
   - Document issues as they occur
   - Include all attempted solutions, even failed ones
   - Add verification steps and results
   - Get manual confirmation before committing changes

4. **Maintenance**:
   - Review entries monthly
   - Update outdated solutions
   - Archive resolved issues
   - Cross-reference related issues

## Documentation Strategy
This file is automatically maintained and updated by the AI assistant whenever issues are encountered and resolved. Here's how the documentation is structured:

### Format
Each issue is documented using the following template:
```markdown
## [Issue Category] - [Date]
### Problem
- Description of the issue
- Error messages or symptoms

### Solution
- Steps taken to resolve
- Code changes
- Configuration updates

### Result
- Verification of the fix
- Any follow-up notes
```

### Update Process
1. **Automatic Updates**:
   - File is checked and updated with each new development session
   - New issues and solutions are documented immediately when resolved
   - Timestamps are included for all entries

2. **Entry Categories**:
   - Database Issues
   - Authentication Problems
   - Frontend Bugs
   - Permission/Access Control
   - Configuration Issues
   - Performance Optimizations

3. **Documentation Includes**:
   - Detailed error descriptions
   - Step-by-step solutions
   - Code snippets when relevant
   - Verification steps
   - Links to related issues or dependencies

This documentation strategy ensures that all project issues and their solutions are properly tracked and can be referenced for future troubleshooting.
