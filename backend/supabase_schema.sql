-- merchants table
create table merchants (
  id text primary key,
  name text,
  wallet_address text,
  created_at timestamp default now()
);

-- transactions table
create table transactions (
  id text primary key,
  merchant_id text references merchants(id),
  amount_idr numeric,
  amount_token numeric,
  token_symbol text,
  chain text,
  tx_hash text,
  status text,
  ai_explanation text,
  created_at timestamp default now()
);
