/**
 * AI Moderation Service for StoryConnect
 * Handles content moderation for stories before and after publishing
 */

export interface ModerationResult {
  risk: number; // 0-1 scale
  tags: string[];
  decision: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SHADOW';
  confidence: number;
  reason?: string;
}

export interface ModerationInput {
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  text?: string;
  mediaUrl?: string;
  thumbUrl?: string;
  metadata?: {
    duration?: number;
    size?: number;
    dimensions?: { width: number; height: number };
  };
}

class ModerationService {
  private apiUrl: string;
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    this.apiUrl = process.env.MODERATION_API_URL || '';
    this.apiKey = process.env.MODERATION_API_KEY || '';
    this.isEnabled = process.env.ENABLE_AI_MODERATION === 'true';
  }

  /**
   * Moderate content synchronously (pre-publish)
   * Should complete within 300ms
   */
  async moderateSync(input: ModerationInput): Promise<ModerationResult> {
    if (!this.isEnabled) {
      return {
        risk: 0.1,
        tags: [],
        decision: 'APPROVED',
        confidence: 1.0,
      };
    }

    try {
      // For text content, use fast text analysis
      if (input.type === 'TEXT' && input.text) {
        return await this.moderateTextSync(input.text);
      }

      // For media content, use thumbnail analysis
      if (input.type === 'IMAGE' && input.thumbUrl) {
        return await this.moderateImageSync(input.thumbUrl);
      }

      if (input.type === 'VIDEO' && input.thumbUrl) {
        return await this.moderateVideoSync(input.thumbUrl, input.metadata);
      }

      // Default approval for unsupported types
      return {
        risk: 0.2,
        tags: ['manual_review_needed'],
        decision: 'PENDING',
        confidence: 0.5,
        reason: 'Content type requires manual review',
      };
    } catch (error) {
      console.error('Moderation sync error:', error);
      // On error, default to pending for manual review
      return {
        risk: 0.5,
        tags: ['moderation_error'],
        decision: 'PENDING',
        confidence: 0.3,
        reason: 'Moderation service error',
      };
    }
  }

  /**
   * Moderate content asynchronously (post-publish)
   * Can take up to 2 minutes for deep analysis
   */
  async moderateAsync(input: ModerationInput): Promise<ModerationResult> {
    if (!this.isEnabled) {
      return {
        risk: 0.1,
        tags: [],
        decision: 'APPROVED',
        confidence: 1.0,
      };
    }

    try {
      // Perform deep analysis
      const result = await this.performDeepAnalysis(input);
      
      // If the decision is more restrictive than the current one, update
      if (this.isDecisionMoreRestrictive(result.decision, 'APPROVED')) {
        return result;
      }

      return {
        risk: result.risk,
        tags: result.tags,
        decision: 'APPROVED', // Keep approved if async analysis is less restrictive
        confidence: result.confidence,
      };
    } catch (error) {
      console.error('Moderation async error:', error);
      return {
        risk: 0.3,
        tags: ['async_moderation_error'],
        decision: 'APPROVED', // Don't change decision on async error
        confidence: 0.5,
      };
    }
  }

  private async moderateTextSync(text: string): Promise<ModerationResult> {
    // Simple keyword-based analysis for sync moderation
    const harmfulKeywords = [
      'hate', 'violence', 'abuse', 'harassment', 'threat',
      'spam', 'scam', 'fake', 'misleading',
      'nsfw', 'adult', 'explicit', 'sexual',
    ];

    const suspiciousKeywords = [
      'click here', 'free money', 'win now', 'limited time',
      'act now', 'don\'t miss', 'exclusive offer',
    ];

    let risk = 0.1;
    const tags: string[] = [];

    const lowerText = text.toLowerCase();

    // Check for harmful content
    for (const keyword of harmfulKeywords) {
      if (lowerText.includes(keyword)) {
        risk += 0.3;
        tags.push('harmful_content');
        break;
      }
    }

    // Check for spam/suspicious content
    for (const keyword of suspiciousKeywords) {
      if (lowerText.includes(keyword)) {
        risk += 0.2;
        tags.push('suspicious_content');
        break;
      }
    }

    // Check text length and complexity
    if (text.length > 200) {
      risk += 0.1;
      tags.push('long_text');
    }

    // Determine decision
    let decision: ModerationResult['decision'];
    if (risk >= 0.7) {
      decision = 'REJECTED';
    } else if (risk >= 0.4) {
      decision = 'PENDING';
    } else {
      decision = 'APPROVED';
    }

    return {
      risk: Math.min(risk, 1.0),
      tags: [...new Set(tags)], // Remove duplicates
      decision,
      confidence: 0.8,
    };
  }

  private async moderateImageSync(imageUrl: string): Promise<ModerationResult> {
    // For sync moderation, we can only do basic checks
    // In a real implementation, you might use a fast image analysis API
    
    try {
      // Simulate API call to image moderation service
      const response = await fetch(`${this.apiUrl}/moderate-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          fast_mode: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Image moderation API error');
      }

      const result = await response.json();
      return {
        risk: result.risk || 0.2,
        tags: result.tags || [],
        decision: this.riskToDecision(result.risk || 0.2),
        confidence: result.confidence || 0.7,
      };
    } catch (error) {
      console.error('Image moderation error:', error);
      // Default to pending for manual review
      return {
        risk: 0.3,
        tags: ['image_analysis_error'],
        decision: 'PENDING',
        confidence: 0.5,
        reason: 'Image analysis failed',
      };
    }
  }

  private async moderateVideoSync(videoUrl: string, metadata?: any): Promise<ModerationResult> {
    // For video sync moderation, analyze thumbnail and metadata
    const tags: string[] = [];
    let risk = 0.2;

    // Check video duration
    if (metadata?.duration && metadata.duration > 15) {
      risk += 0.1;
      tags.push('long_video');
    }

    // Check file size
    if (metadata?.size && metadata.size > 25 * 1024 * 1024) { // 25MB
      risk += 0.1;
      tags.push('large_file');
    }

    // In a real implementation, you would analyze video thumbnail here
    // For now, default to pending for manual review
    return {
      risk,
      tags,
      decision: 'PENDING',
      confidence: 0.6,
      reason: 'Video requires manual review',
    };
  }

  private async performDeepAnalysis(input: ModerationInput): Promise<ModerationResult> {
    // Simulate deep analysis API call
    try {
      const response = await fetch(`${this.apiUrl}/moderate-deep`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: input.type,
          text: input.text,
          media_url: input.mediaUrl,
          metadata: input.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Deep moderation API error');
      }

      const result = await response.json();
      return {
        risk: result.risk || 0.1,
        tags: result.tags || [],
        decision: this.riskToDecision(result.risk || 0.1),
        confidence: result.confidence || 0.9,
      };
    } catch (error) {
      console.error('Deep moderation error:', error);
      return {
        risk: 0.2,
        tags: ['deep_analysis_error'],
        decision: 'APPROVED', // Don't penalize on deep analysis error
        confidence: 0.5,
      };
    }
  }

  private riskToDecision(risk: number): ModerationResult['decision'] {
    if (risk >= 0.8) return 'REJECTED';
    if (risk >= 0.6) return 'SHADOW';
    if (risk >= 0.4) return 'PENDING';
    return 'APPROVED';
  }

  private isDecisionMoreRestrictive(
    newDecision: ModerationResult['decision'],
    currentDecision: ModerationResult['decision']
  ): boolean {
    const restrictiveness = {
      'APPROVED': 0,
      'SHADOW': 1,
      'PENDING': 2,
      'REJECTED': 3,
    };

    return restrictiveness[newDecision] > restrictiveness[currentDecision];
  }

  /**
   * Batch moderate multiple items
   */
  async moderateBatch(inputs: ModerationInput[]): Promise<ModerationResult[]> {
    const results = await Promise.all(
      inputs.map(input => this.moderateSync(input))
    );
    return results;
  }

  /**
   * Get moderation statistics for admin dashboard
   */
  async getModerationStats(): Promise<{
    totalModerated: number;
    approved: number;
    pending: number;
    rejected: number;
    shadow: number;
    avgProcessingTime: number;
  }> {
    // In a real implementation, this would query your database
    return {
      totalModerated: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      shadow: 0,
      avgProcessingTime: 0,
    };
  }
}

// Export singleton instance
export const moderationService = new ModerationService();

// Export types
export type { ModerationResult, ModerationInput };

