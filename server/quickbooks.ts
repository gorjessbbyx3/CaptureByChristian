
import crypto from 'crypto';

interface QuickBooksCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  companyId?: string;
  sandboxMode: boolean;
}

interface QuickBooksCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: any;
}

interface QuickBooksInvoice {
  id: string;
  customerId: string;
  amount: number;
  dueDate: string;
  status: string;
  lineItems: any[];
}

export class QuickBooksService {
  private credentials: QuickBooksCredentials;
  private baseUrl: string;

  constructor(credentials: QuickBooksCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.sandboxMode 
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com';
  }

  async validateConnection(): Promise<boolean> {
    try {
      if (!this.credentials.accessToken) {
        return false;
      }

      // Test connection with a simple API call
      const response = await this.makeApiCall('/v3/companyinfo/' + this.credentials.companyId);
      return response.status === 200;
    } catch (error) {
      console.error('QuickBooks connection validation failed:', error);
      return false;
    }
  }

  async syncCustomers(localClients: any[]): Promise<{ synced: number; created: number; updated: number }> {
    const results = { synced: 0, created: 0, updated: 0 };

    try {
      // Get existing QuickBooks customers
      const qbCustomers = await this.getCustomers();
      
      for (const client of localClients) {
        const existingCustomer = qbCustomers.find(c => 
          c.email?.toLowerCase() === client.email?.toLowerCase()
        );

        if (existingCustomer) {
          // Update existing customer if needed
          await this.updateCustomer(existingCustomer.id, client);
          results.updated++;
        } else {
          // Create new customer
          await this.createCustomer(client);
          results.created++;
        }
        results.synced++;
      }

      return results;
    } catch (error) {
      console.error('Customer sync failed:', error);
      throw new Error('Failed to sync customers with QuickBooks');
    }
  }

  async syncInvoices(localBookings: any[]): Promise<{ synced: number; created: number; updated: number }> {
    const results = { synced: 0, created: 0, updated: 0 };

    try {
      // Get existing QuickBooks invoices
      const qbInvoices = await this.getInvoices();

      for (const booking of localBookings) {
        const invoiceRef = `BOOKING-${booking.id}`;
        const existingInvoice = qbInvoices.find(inv => 
          inv.customerRef === `CLIENT-${booking.clientId}`
        );

        if (existingInvoice) {
          // Update existing invoice if needed
          await this.updateInvoice(existingInvoice.id, booking);
          results.updated++;
        } else {
          // Create new invoice
          await this.createInvoice(booking);
          results.created++;
        }
        results.synced++;
      }

      return results;
    } catch (error) {
      console.error('Invoice sync failed:', error);
      throw new Error('Failed to sync invoices with QuickBooks');
    }
  }

  private async getCustomers(): Promise<QuickBooksCustomer[]> {
    try {
      const response = await this.makeApiCall('/v3/query', {
        method: 'GET',
        params: { query: "SELECT * FROM Customer" }
      });

      return response.data?.QueryResponse?.Customer || [];
    } catch (error) {
      console.error('Failed to fetch QuickBooks customers:', error);
      return [];
    }
  }

  private async createCustomer(client: any): Promise<QuickBooksCustomer> {
    const customerData = {
      Name: client.name,
      CompanyName: client.name,
      BillAddr: {
        Line1: client.address || '',
        City: 'Honolulu',
        Country: 'USA',
        CountrySubDivisionCode: 'HI'
      },
      PrimaryEmailAddr: {
        Address: client.email
      },
      PrimaryPhone: {
        FreeFormNumber: client.phone || ''
      }
    };

    const response = await this.makeApiCall('/v3/customer', {
      method: 'POST',
      data: customerData
    });

    return response.data?.QueryResponse?.Customer?.[0];
  }

  private async updateCustomer(customerId: string, client: any): Promise<QuickBooksCustomer> {
    // First get the current customer to get the SyncToken
    const currentCustomer = await this.makeApiCall(`/v3/customer/${customerId}`);
    
    const updateData = {
      ...currentCustomer.data.Customer,
      Name: client.name,
      PrimaryEmailAddr: {
        Address: client.email
      },
      PrimaryPhone: {
        FreeFormNumber: client.phone || ''
      }
    };

    const response = await this.makeApiCall('/v3/customer', {
      method: 'POST',
      data: updateData
    });

    return response.data?.QueryResponse?.Customer?.[0];
  }

  private async getInvoices(): Promise<QuickBooksInvoice[]> {
    try {
      const response = await this.makeApiCall('/v3/query', {
        method: 'GET',
        params: { query: "SELECT * FROM Invoice" }
      });

      return response.data?.QueryResponse?.Invoice || [];
    } catch (error) {
      console.error('Failed to fetch QuickBooks invoices:', error);
      return [];
    }
  }

  private async createInvoice(booking: any): Promise<QuickBooksInvoice> {
    const invoiceData = {
      Line: [{
        Amount: parseFloat(booking.totalPrice),
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: '1', // Default service item ID
            name: 'Photography Services'
          }
        }
      }],
      CustomerRef: {
        value: `CLIENT-${booking.clientId}`
      },
      TotalAmt: parseFloat(booking.totalPrice),
      DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const response = await this.makeApiCall('/v3/invoice', {
      method: 'POST',
      data: invoiceData
    });

    return response.data?.QueryResponse?.Invoice?.[0];
  }

  private async updateInvoice(invoiceId: string, booking: any): Promise<QuickBooksInvoice> {
    // Similar to updateCustomer, need to get current invoice first
    const currentInvoice = await this.makeApiCall(`/v3/invoice/${invoiceId}`);
    
    const updateData = {
      ...currentInvoice.data.Invoice,
      TotalAmt: parseFloat(booking.totalPrice)
    };

    const response = await this.makeApiCall('/v3/invoice', {
      method: 'POST',
      data: updateData
    });

    return response.data?.QueryResponse?.Invoice?.[0];
  }

  private async makeApiCall(endpoint: string, options: any = {}): Promise<any> {
    const { method = 'GET', data, params } = options;
    
    if (!this.credentials.accessToken) {
      throw new Error('No access token available');
    }

    const url = new URL(this.baseUrl + endpoint + '/' + this.credentials.companyId);
    
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), requestOptions);
    
    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.status} ${response.statusText}`);
    }

    return {
      status: response.status,
      data: await response.json()
    };
  }

  static generateOAuthUrl(credentials: QuickBooksCredentials, redirectUri: string): string {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'com.intuit.quickbooks.accounting';
    
    const authUrl = credentials.sandboxMode
      ? 'https://appcenter.intuit.com/connect/oauth2'
      : 'https://appcenter.intuit.com/connect/oauth2';

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      scope,
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state
    });

    return `${authUrl}?${params.toString()}`;
  }

  static async exchangeCodeForTokens(
    code: string, 
    redirectUri: string, 
    credentials: QuickBooksCredentials
  ): Promise<{ accessToken: string; refreshToken: string; companyId: string }> {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      companyId: tokenData.realmId
    };
  }
}
