import { createAdminClient } from '@/utils/supabase/admin';

/**
 * One-time utility to migrate cover images from the incorrect nested path
 * (cover-images/cover-images/campaigns) to the correct path (cover-images/campaigns)
 *
 * Usage: Run this once via a server action or direct call, then delete this file
 */
export async function migrateCoverImages() {
  try {
    const adminSupabase = createAdminClient();
    const bucket = 'camp-man-files';

    // List all files in the incorrect nested path
    const { data: files, error: listError } = await adminSupabase.storage
      .from(bucket)
      .list('cover-images/cover-images/campaigns', {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return { success: false, error: listError.message };
    }

    if (!files || files.length === 0) {
      console.log('No files to migrate');
      return { success: true, message: 'No files found to migrate' };
    }

    console.log(`Found ${files.length} files to migrate`);

    // Move each file to the correct location
    for (const file of files) {
      if (file.id === null) continue; // Skip folders

      const oldPath = `cover-images/cover-images/campaigns/${file.name}`;
      const newPath = `cover-images/campaigns/${file.name}`;

      try {
        // Download the file
        const { data: fileData, error: downloadError } = await adminSupabase.storage
          .from(bucket)
          .download(oldPath);

        if (downloadError) {
          console.error(`Failed to download ${oldPath}:`, downloadError);
          continue;
        }

        // Upload to the correct location
        const { error: uploadError } = await adminSupabase.storage
          .from(bucket)
          .upload(newPath, fileData, { upsert: true });

        if (uploadError) {
          console.error(`Failed to upload ${newPath}:`, uploadError);
          continue;
        }

        // Delete the old file
        const { error: deleteError } = await adminSupabase.storage
          .from(bucket)
          .remove([oldPath]);

        if (deleteError) {
          console.error(`Failed to delete ${oldPath}:`, deleteError);
          continue;
        }

        console.log(`Migrated: ${file.name}`);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    // Remove the empty nested folder
    try {
      await adminSupabase.storage
        .from(bucket)
        .remove(['cover-images/cover-images']);
      console.log('Cleaned up empty nested folder');
    } catch (error) {
      console.log('Note: Could not remove empty folder (may need manual cleanup)');
    }

    return { success: true, message: 'Migration completed' };
  } catch (error: any) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  }
}
