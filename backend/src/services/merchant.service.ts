import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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

  async createMerchant(name: string, walletAddress: string): Promise<{ success: boolean; data?: Merchant; message?: string }> {
    try {
      const id = `m_${uuidv4().substring(0, 8)}`;
      
      const newMerchant: Merchant = {
        id,
        name,
        wallet_address: walletAddress
      };

      const { data, error } = await this.supabase
        .from('merchants')
        .insert([newMerchant])
        .select()
        .single();

      if (error) {
        console.error('Error inserting merchant:', error);
        return { success: false, message: 'Failed to create merchant.' };
      }

      return { success: true, data: data as Merchant };
    } catch (err) {
      console.error('Unexpected error creating merchant:', err);
      return { success: false, message: 'Unexpected server error.' };
    }
  }
}
