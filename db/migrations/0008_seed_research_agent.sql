INSERT INTO agents (
  id,
  name,
  status,
  created_at,
  updated_at
)
VALUES (
  'agent_research_alpha',
  'Research Alpha',
  'active',
  timezone('utc', now())::text,
  timezone('utc', now())::text
)
ON CONFLICT (id) DO NOTHING;
