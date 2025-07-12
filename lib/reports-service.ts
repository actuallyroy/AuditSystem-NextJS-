// Reports service for handling API calls
// Based on the reports API specification

const API_BASE_URL = 'https://test.scorptech.co/api/v1';

// Types matching the reports API spec
export interface ReportTypeDto {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface TemplateDto {
  id: string;
  name: string;
}

export interface ReportResponseDto {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  size: string;
  format: "PDF" | "XLSX" | "CSV";
  downloadUrl: string;
}

export interface GenerateReportDto {
  reportType: string;
  fromDate?: string;
  toDate?: string;
  region?: string;
  templateId?: string;
  format: "pdf" | "xlsx" | "csv";
}

export interface ApiError {
  message: string;
  errors?: string[];
}

class ReportsService {
  
  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      token: string;
      onTokenExpired?: () => void;
    }
  ): Promise<T> {
    const { method = 'GET', body, token, onTokenExpired } = options;
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making ${method} request to: ${url}`);
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status} for ${url}`);

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && onTokenExpired) {
          console.log('Token expired, calling onTokenExpired');
          onTokenExpired();
          throw new Error('Session expired. Please login again.');
        }
        
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        console.error(`API Error for ${url}:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Handle empty responses
      if (response.status === 204) {
        console.log(`Empty response (204) for ${url}`);
        return null as T;
      }

      try {
        const data = await response.json();
        console.log(`Successfully parsed response for ${url}:`, data);
        return data;
      } catch (parseError) {
        console.error(`Failed to parse JSON response for ${url}:`, parseError);
        return null as T;
      }
    } catch (fetchError) {
      console.error(`Fetch error for ${url}:`, fetchError);
      throw fetchError;
    }
  }

  /**
   * Get report types
   */
  async getReportTypes(token: string, onTokenExpired?: () => void): Promise<ReportTypeDto[]> {
    try {
      const reportTypes = await this.makeRequest<ReportTypeDto[]>('/reports/types', { token, onTokenExpired });
      return reportTypes || [];
    } catch (error) {
      console.error('Error fetching report types:', error);
      throw error;
    }
  }

  /**
   * Get templates list
   */
  async getTemplates(token: string, onTokenExpired?: () => void): Promise<TemplateDto[]> {
    try {
      const templates = await this.makeRequest<TemplateDto[]>('/templates/list', { token, onTokenExpired });
      return templates || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get recent reports
   */
  async getRecentReports(token: string, onTokenExpired?: () => void): Promise<ReportResponseDto[]> {
    try {
      const reports = await this.makeRequest<ReportResponseDto[]>('/reports/recent', { token, onTokenExpired });
      return reports || [];
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      throw error;
    }
  }

  /**
   * Generate a new report
   */
  async generateReport(reportData: GenerateReportDto, token: string, onTokenExpired?: () => void): Promise<any> {
    try {
      const result = await this.makeRequest<any>('/reports/generate', { 
        method: 'POST', 
        body: reportData, 
        token, 
        onTokenExpired 
      });
      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Download a report
   */
  async downloadReport(reportId: string, token: string, onTokenExpired?: () => void): Promise<Blob> {
    try {
      const url = `${API_BASE_URL}/reports/download/${reportId}`;
      console.log(`Downloading report from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && onTokenExpired) {
          onTokenExpired();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService(); 