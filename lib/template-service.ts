// Template service for handling API calls

const API_BASE_URL = 'http://localhost:5049/api/v1';

// Types
export interface Template {
  templateId: string;
  name: string;
  description: string;
  category: string;
  questions: string; // JSON string
  scoringRules: string; // JSON string
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  questions: string; // JSON string
  scoringRules: string; // JSON string
  validFrom: string;
  validTo: string;
}

export interface UpdateTemplateRequest extends CreateTemplateRequest {
  templateId: string;
}

export interface TemplateQuestion {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[]; // For multiple choice questions
  minValue?: number; // For number questions with range
  maxValue?: number; // For number questions with range
}

export interface TemplateSection {
  title: string;
  questions: TemplateQuestion[];
}

export interface TemplateQuestions {
  sections: TemplateSection[];
}

export interface ScoringRules {
  maxScore: number;
  passThreshold: number;
  questionScores: Record<string, number>; // Maps question ID to score value
}

// API error response type
export interface ApiError {
  message: string;
}

class TemplateService {
  /**
   * Get all templates
   */
  async getTemplates(token: string): Promise<Template[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get templates');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching templates');
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplateById(templateId: string, token: string): Promise<Template> {
    try {
      const response = await fetch(`${API_BASE_URL}/Templates/${templateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get template');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching the template');
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(templateData: CreateTemplateRequest, token: string): Promise<Template> {
    try {
      const response = await fetch(`${API_BASE_URL}/Templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to create template');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the template');
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(templateData: UpdateTemplateRequest, token: string): Promise<Template> {
    try {
      const response = await fetch(`${API_BASE_URL}/Templates/${templateData.templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to update template');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating the template');
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/Templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to delete template');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting the template');
    }
  }
}

export const templateService = new TemplateService(); 