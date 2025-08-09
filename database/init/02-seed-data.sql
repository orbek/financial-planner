-- Sample data for testing
-- This script inserts sample data for development and testing

-- Sample user (this would normally come from OAuth)
INSERT INTO users (id, email, name, external_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'carlos@example.com', 'Carlos Barbosa', 'microsoft-oauth-123456')
ON CONFLICT (email) DO NOTHING;

-- Sample accounts
INSERT INTO accounts (id, user_id, name, type, balance, currency) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'microsoft-oauth-123456', 'Chase Checking', 'checking', 5240.50, 'USD'),
('550e8400-e29b-41d4-a716-446655440002', 'microsoft-oauth-123456', 'Savings Account', 'savings', 15750.00, 'USD'),
('550e8400-e29b-41d4-a716-446655440003', 'microsoft-oauth-123456', 'Credit Card', 'credit', -1250.75, 'USD'),
('550e8400-e29b-41d4-a716-446655440004', 'microsoft-oauth-123456', 'Investment Portfolio', 'investment', 32500.25, 'USD')
ON CONFLICT (id) DO NOTHING;

-- Sample transactions (last 3 months)
INSERT INTO transactions (user_id, account_id, date, amount, type, description, category) VALUES 
-- Checking account transactions
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 4500.00, 'Salary', 'Monthly Salary Deposit', 'Salary'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-01-16', -125.50, 'Food', 'Grocery Store Purchase', 'Food'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-01-17', -45.00, 'Transport', 'Gas Station', 'Transportation'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-01-18', -1200.00, 'Housing', 'Rent Payment', 'Housing'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-01-20', -75.25, 'Food', 'Restaurant Dinner', 'Food'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-01-22', -500.00, 'Transfer', 'Transfer to Savings', 'Transfer'),

-- Savings account transactions
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440002', '2024-01-22', 500.00, 'Transfer', 'Transfer from Checking', 'Transfer'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440002', '2024-01-31', 12.50, 'Interest', 'Monthly Interest', 'Other'),

-- Credit card transactions
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440003', '2024-01-15', -89.99, 'Shopping', 'Amazon Purchase', 'Shopping'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440003', '2024-01-16', -156.78, 'Food', 'Costco Groceries', 'Food'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440003', '2024-01-18', -67.45, 'Entertainment', 'Movie Theater', 'Entertainment'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440003', '2024-01-20', -234.50, 'Shopping', 'Electronics Store', 'Shopping'),

-- Investment account transactions
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440004', '2024-01-15', 1000.00, 'Investment', 'Monthly Investment Contribution', 'Investment'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440004', '2024-01-31', 250.25, 'Investment', 'Portfolio Gains', 'Investment'),

-- February transactions
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-02-15', 4500.00, 'Salary', 'Monthly Salary Deposit', 'Salary'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-02-16', -134.75, 'Food', 'Grocery Shopping', 'Food'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-02-17', -52.30, 'Transport', 'Gas Station', 'Transportation'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-02-18', -1200.00, 'Housing', 'Rent Payment', 'Housing'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-02-20', -89.50, 'Entertainment', 'Concert Tickets', 'Entertainment'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-02-25', -500.00, 'Transfer', 'Transfer to Savings', 'Transfer'),

-- March transactions (current month)
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-03-15', 4500.00, 'Salary', 'Monthly Salary Deposit', 'Salary'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-03-16', -142.25, 'Food', 'Weekly Groceries', 'Food'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-03-17', -48.75, 'Transport', 'Gas Station', 'Transportation'),
('microsoft-oauth-123456', '550e8400-e29b-41d4-a716-446655440001', '2024-03-18', -1200.00, 'Housing', 'Rent Payment', 'Housing')
ON CONFLICT DO NOTHING;

-- Sample budgets
INSERT INTO budgets (user_id, category, amount, period) VALUES 
('microsoft-oauth-123456', 'Food', 800.00, 'monthly'),
('microsoft-oauth-123456', 'Transportation', 300.00, 'monthly'),
('microsoft-oauth-123456', 'Entertainment', 200.00, 'monthly'),
('microsoft-oauth-123456', 'Shopping', 400.00, 'monthly'),
('microsoft-oauth-123456', 'Housing', 1200.00, 'monthly')
ON CONFLICT (user_id, category, period) DO NOTHING;

-- Sample goals
INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, category, description) VALUES 
('microsoft-oauth-123456', 'Emergency Fund', 10000.00, 6500.00, '2024-12-31', 'savings', 'Build 6-month emergency fund'),
('microsoft-oauth-123456', 'Vacation to Europe', 5000.00, 2800.00, '2024-08-01', 'travel', 'Summer vacation trip to Europe'),
('microsoft-oauth-123456', 'New Car Down Payment', 8000.00, 1200.00, '2025-06-01', 'transportation', 'Down payment for new vehicle'),
('microsoft-oauth-123456', 'House Down Payment', 50000.00, 15000.00, '2026-01-01', 'housing', 'Save for first home purchase')
ON CONFLICT DO NOTHING;

-- Sample goal contributions
INSERT INTO goal_contributions (goal_id, amount, contribution_date, notes) VALUES 
((SELECT id FROM goals WHERE name = 'Emergency Fund' LIMIT 1), 500.00, '2024-01-22', 'Monthly savings transfer'),
((SELECT id FROM goals WHERE name = 'Emergency Fund' LIMIT 1), 500.00, '2024-02-25', 'Monthly savings transfer'),
((SELECT id FROM goals WHERE name = 'Vacation to Europe' LIMIT 1), 400.00, '2024-01-15', 'Vacation fund contribution'),
((SELECT id FROM goals WHERE name = 'Vacation to Europe' LIMIT 1), 400.00, '2024-02-15', 'Vacation fund contribution')
ON CONFLICT DO NOTHING;
