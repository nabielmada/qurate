import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Merchant {
  id: string;
  name: string;
  wallet_address: string;
  created_at?: string;
}

@Injectable()
export class MerchantService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
  }

  async getMerchantById(id: string): Promise<Merchant | null> {
    const { data, error } = await this.supabase
      .from('merchants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error(`Error fetching merchant ${id}:`, error);
      return null;
    }

    return data as Merchant;
  }
}
