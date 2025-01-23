const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btzllgnzmjdxzdioulfu.supabase.co';
const supabaseKey = 'sbp_9058083e37b5ddbe047c13f29247f7ce4b87c271';

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeProductPriceOptional() {
  try {
    const { data, error } = await supabase.rpc('make_price_optional');
    if (error) throw error;
    console.log('Successfully made price optional');
  } catch (error) {
    console.error('Error:', error);
  }
}

makeProductPriceOptional();
