-- Create a default user for v1 (no auth)
INSERT INTO users (id, email, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@apiforge.dev', 'Demo User')
ON CONFLICT (id) DO NOTHING;
