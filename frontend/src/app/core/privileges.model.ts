/**
 * Identical to same model class on server
 * I currently differentiate between 3 roles: user, manager, admin
 * When a user changes their role, the activeRoles key is filled with all 
 * associated privilges that the user has for that role
 * activePrivilges will also always contain all "previous level" rroles. i.e. when user is manager 
 * he also has all user roles in activeRoles
 */

export class Privileges {

  static privileges: any[] = [
    {"role": "user", "module": "oto", "key": "otoUser"},
    // Basic stuff like editing own user. Present as preparation for non logged in access

    {"role": "user", "module": "tools", "key": "toolsUser"},
    // Access Tools module

    {"role": "user", "module": "lims", "key": "limsUser"},
    // Access LIMS Module. Access to topic are separately managed

    {"role": "user", "module": "genseqhub", "key": "genseqhubUser"},
    // Access Genseqhub module

    {"role": "user", "module": "bioinf", "key": "bioinfUser"},
    // Acess Bioinf Module
    // Admin Module: view Pipelines and Running Pages (read only, no changes allowed)
    // Navbar: view Dashboard icon
    {"role": "user", "module": "bioinf start wgs", "key": "bioinfWgs"},
    // Start and Show wgs pipelines

    {"role": "user", "module": "resources", "key": "resourcesUser"},
    // Use resources page. 
    // (All resources and reservations are visible to all users. Every user can change/delete reseravtions of other users)

    {"role": "user", "module": "luxgenIncoming", "key": "luxgenIncomingUser"},
    // View luxgen incoming page
    // (users can nonly see their own projects)
    // (users can add indexes and preps here but only change their own)

    {"role": "user", "module": "luxgenSeq", "key": "luxgenSeqUser"},
    // View sequencers page
    // View runs page

    {"role": "user", "module": "luxgen start pipelines", "key": "luxgenStartPipelinesUser"},
    // Runs page: 
    // - Start pipelines via buttons listed at bottom

    {"role": "user", "module": "luxgen transfer", "key": "luxgenTransferUser"},
    // Transfer data
    // (luxgen runs page and start bioinf app)

    {"role": "user", "module": "luxgenReads", "key": "luxgenReadsUser"},
    // View reads page

    {"role": "user", "module": "luxgenPreps", "key": "luxgenPrepsUser"},
    // View preps page

    {"role": "user", "module": "variants", "key": "variantsUser"},
    // View variants page

    {"role": "user", "module": "veriseq", "key": "veriseqUser"},
    // View veriseq page (no changes allowed)

    /* MANAGER */
    {"role": "manager", "module": "luxgen", "key": "luxgenManager"},
    // Sequencers Page: 
      // - delete invalid folders on machine or server
      // - add / remove default chains for runs
    // Runs page:
      // - rename run experiment names
      // - reload sample sheet

    {"role": "manager", "module": "bioinf", "key": "bioinfManager"},
    
    {"role": "manager", "module": "bioinf manage filtersets", "key": "bioinfManageFiltersets"},
    // Wgs change filtersets to hardcoded and include in default lists

    {"role": "manager", "module": "veriseq", "key": "veriseqManager"},
    // Veriseq Module: Create samplesheet
    // Veriseq Module: Release batch
    // Veriseq Module: Use the "repeat" checkbox

    {"role": "manager", "module": "variants", "key": "variantsManager"},
    // Edit / delete all comments

    /* ADMIN */
    {"role": "admin", "module": "lims", "key": "limsAdmin"},
    // Navbar: view admin button
    // Admin page: view backgrounds jobs page
    // Admin page: view and start GLIMS import jobs
    
    {"role": "admin", "module": "genseqhub", "key": "genseqhubAdmin"},
    // Genseqhub: Launch whole filesystem checks (update only)
    // Genseqhub: Manage librarypreps
    // Genseqhub: View last parse info at bottom of page
    
    {"role": "admin", "module": "bioinf", "key": "bioinfAdmin"},
    // Admin page, bioinf: delete pipelines
    // Admin page, queues: change priority
    // Pipeline header: delete pipelines started by system
    
    {"role": "admin", "module": "resources", "key": "resourcesAdmin"},
    // Resources page: Create / rename / delete resources
    
    {"role": "admin", "module": "luxgen", "key": "luxgenAdmin"},
    // Luxgen: access config menu (library preps, indexes)
    // (Admin can also change indexes, preps created by other users)
    // Luxgen Incoming: approve, reject projects
    // Luxgen Incoming: view all projects of all users
    // Luxgen Preps: view all preps of all users
    // Luxgen Preps: view group
    // Luxgen Preps: delete prep
    // Luxgen Reads: view group
    // Luxgen Reads: add remove prep
    // Luxgen Sequencers: Can view invalid folders
    // Luxgen Sequencers: Parse manually
    // Luxgen Sequencers: Sync runs
    // Luxgen Sequencers: Delete runs
    // Luxgen Sequencers: Remove ALL warnings
    // Luxgen Sequencers: Clear ALL history

    {"role": "admin", "module": "dev", "key": "devAdmin"},
    // Navbar, access debug button
    // Admin background jobs:  Relink pipelines button
    // Pipelines: view WIP pipelines and start them,  overview and start new page TODO (dev role)
    // Pipelines: View Outputs part on Start New Pipleine Page
    // Luxgen Runs: rename experiment button
    // Genseqhub: Launch whole filesystem checks (including delete first)

    {"role": "admin", "module": "velona", "key": "otoAdmin"},
    // Can view all pages
    // Navbar view dashboard button
    // Navbar, change to system group
    // Admin: Only role that can access user / group / lab / browse pages
    // Admin background jobs: delete & import all for GLIMS import
    // Admin background jobs: access all background jobs
    // Admin background jobs: view tasksStatus info at bottom of page
    // LIMS: view domains
    // Luxgen Runs: manage preps
  ];
}
