import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService implements OnModuleInit {
  private supabase: SupabaseClient;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is missing from .env');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase successfully');
  }

  /**
   * Creates a new campaign in the 'hc_campaigns' table
   */
  async create(dto: CreateCampaignDto) {
    const { data, error } = await this.supabase
      .from('hc_campaigns') // Fixed: Matches your Supabase table name
      .insert([
        {
          title: dto.title,
          target_amount: dto.target_amount,
          description: dto.description,
          collected_amount: 0,
          cover_image_key: dto.cover_image_key || 'default_cover.jpg',
          // Fixed: Must be 'draft' or 'active' per your DB constraints
          status: 'draft', 
          // Fixed: Satisfies the NOT NULL constraint for created_by
          created_by: '00000000-0000-0000-0000-000000000000', 
          start_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error.message);
      throw new InternalServerErrorException(`Could not save to Supabase: ${error.message}`);
    }

    return data[0];
  }

  /**
   * Fetches all campaigns from 'hc_campaigns'
   */
  async findAll() {
    const { data, error } = await this.supabase
      .from('hc_campaigns') // Fixed: Was 'campaigns', now matches your DB
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Fetch Error:', error.message);
      throw new InternalServerErrorException(`Could not fetch from Supabase: ${error.message}`);
    }

    // Transform snake_case to camelCase for frontend
    return data.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      beneficiary: campaign.beneficiary || 'Not specified',
      raised: campaign.collected_amount || 0,
      goal: campaign.target_amount || 0,
      donors: campaign.donor_count || 0,
      endDate: campaign.end_date || 'TBD',
      status: this.mapStatus(campaign.status),
    }));
  }

  /**
   * Maps database status to frontend status format
   */
  private mapStatus(dbStatus: string): 'Active' | 'Pending' | 'Completed' {
    if (dbStatus === 'active') return 'Active';
    if (dbStatus === 'draft') return 'Pending';
    if (dbStatus === 'completed') return 'Completed';
    return 'Pending';
  }
}