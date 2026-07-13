-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 1. Companies: Users can only see companies they belong to
CREATE POLICY "Users view their companies" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_members
            WHERE company_members.company_id = companies.id
            AND company_members.user_id = auth.uid()
        )
    );

-- 2. Company Members: Users see only their own memberships
CREATE POLICY "Users view own memberships" ON company_members
    FOR SELECT USING (user_id = auth.uid());

-- 3. Service Requests SELECT: Only requests from user's companies
CREATE POLICY "Users view their company requests" ON service_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_members
            WHERE company_members.company_id = service_requests.company_id
            AND company_members.user_id = auth.uid()
        )
    );

-- 4. Service Requests INSERT: Only admins can create
CREATE POLICY "Admins insert requests" ON service_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM company_members
            WHERE company_members.company_id = service_requests.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role = 'admin'
        )
    );

-- 5. Service Requests UPDATE: Only admins can update status
CREATE POLICY "Admins update requests" ON service_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM company_members
            WHERE company_members.company_id = service_requests.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role = 'admin'
        )
    );

-- 6. Invoices SELECT: Only user's company invoices
CREATE POLICY "Users view their company invoices" ON invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_members
            WHERE company_members.company_id = invoices.company_id
            AND company_members.user_id = auth.uid()
        )
    );

-- 7. Invoices management: Only service role (backend) can insert/update
CREATE POLICY "Service role manages invoices" ON invoices
    FOR ALL USING (auth.role() = 'service_role');