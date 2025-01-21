import { supabase } from '../src/integrations/supabase/client';

async function runMigration() {
  try {
    // First get the first royalties type ID
    const { data: firstRoyalty, error: firstError } = await supabase
      .from('income_types')
      .select('id')
      .eq('name', 'Royalties')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (firstError) throw firstError;
    if (!firstRoyalty) {
      console.log('No royalties type found');
      return;
    }

    const royaltiesId = firstRoyalty.id;

    // Get any duplicate royalties
    const { data: duplicates, error: dupError } = await supabase
      .from('income_types')
      .select('id')
      .eq('name', 'Royalties')
      .neq('id', royaltiesId);

    if (dupError) throw dupError;
    if (!duplicates?.length) {
      console.log('No duplicate royalties found');
      return;
    }

    const duplicateIds = duplicates.map(d => d.id);
    console.log(`Found ${duplicateIds.length} duplicate(s)`);

    // Update all references to use the original ID
    const promises = [];

    // Update income_type_settings
    promises.push(
      supabase
        .from('income_type_settings')
        .update({ income_type_id: royaltiesId })
        .in('income_type_id', duplicateIds)
    );

    // Update income_subcategories
    promises.push(
      supabase
        .from('income_subcategories')
        .update({ income_type_id: royaltiesId })
        .in('income_type_id', duplicateIds)
    );

    // Update products
    promises.push(
      supabase
        .from('products')
        .update({ income_type_id: royaltiesId })
        .in('income_type_id', duplicateIds)
    );

    // Delete the duplicates
    promises.push(
      supabase
        .from('income_types')
        .delete()
        .in('id', duplicateIds)
    );

    await Promise.all(promises);
    console.log('Successfully removed duplicate royalties');

  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration();
