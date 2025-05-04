/**
 * A text generation service that works with any topic, not just machine learning
 */

// Libraries of content for various domains
const CONTENT_LIBRARIES = {
  // Categories for different types of responses
  definitions: [
    "a concept that encompasses innovation and creative problem-solving",
    "an approach that integrates multiple perspectives to create solutions",
    "a framework for understanding complex relationships and patterns",
    "a method for transforming ideas into practical applications",
    "a system designed to address specific challenges through structured approaches"
  ],
  
  descriptions: [
    "combines elements of traditional knowledge with cutting-edge innovation",
    "represents a paradigm shift in how we approach complex problems",
    "offers new possibilities for transformation and growth",
    "challenges conventional thinking while building on established principles",
    "connects seemingly unrelated concepts to create something greater than the sum of its parts"
  ],
  
  implications: [
    "This could fundamentally change how we approach similar challenges in the future.",
    "The impact extends beyond immediate applications to influence broader systems.",
    "This has significant implications for how we understand related concepts.",
    "The potential for disruption and innovation is substantial.",
    "This represents just one facet of a rapidly evolving landscape."
  ],
  
  narratives: [
    "What began as a simple idea evolved into something much more significant.",
    "Through years of development, the concept has transformed dramatically.",
    "The journey from theory to practice revealed unexpected insights.",
    "Continuous refinement has led to remarkable improvements over time.",
    "What once seemed impossible is now becoming increasingly mainstream."
  ]
};

// Creative content generators for different styles
const CONTENT_GENERATORS = {
  // Generate a story-like narrative
  createStory: (topic: string): string => {
    const characters = [
      "a dedicated researcher", "an innovative entrepreneur",
      "a skeptical critic", "a visionary leader",
      "a team of diverse collaborators"
    ];
    
    const challenges = [
      "overcoming significant technical obstacles",
      "securing necessary resources and support",
      "challenging established thinking",
      "balancing competing priorities",
      "coordinating complex interdependencies"
    ];
    
    const resolutions = [
      "a breakthrough that changed everything",
      "unexpected connections that revealed new possibilities",
      "a persistent approach that eventually succeeded",
      "an entirely new direction that proved more valuable",
      "a series of incremental improvements with cumulative impact"
    ];
    
    const character = characters[Math.floor(Math.random() * characters.length)];
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];
    
    return `The story of ${topic} begins with ${character} who recognized its potential. 
Despite ${challenge}, they persisted in their vision. What followed was ${resolution}.

As understanding deepened, applications expanded into unexpected areas. What had begun 
as a specialized interest became increasingly relevant across multiple domains. 
Today, ${topic} continues to evolve, with each development opening new possibilities 
for the future.

Looking ahead, we can anticipate further integration with complementary fields, 
creating hybrid approaches that leverage the strengths of each. The full potential 
remains to be discovered, but the trajectory suggests a continuing expansion of 
both theoretical understanding and practical application.`;
  },
  
  // Generate an analytical overview
  createAnalysis: (topic: string): string => {
    const perspectives = [
      "From a theoretical perspective", "From a practical standpoint",
      "In historical context", "Considering future implications",
      "From an interdisciplinary viewpoint"
    ];
    
    const aspects = [
      "core principles and methodologies",
      "key components and their relationships",
      "evolution and developmental milestones",
      "practical applications and case studies",
      "challenges and opportunities"
    ];
    
    const implications = [
      "broader implications for related fields",
      "potential for transformative impact",
      "balance between benefits and limitations",
      "emerging trends and future directions",
      "integration with complementary approaches"
    ];
    
    const perspective1 = perspectives[Math.floor(Math.random() * perspectives.length)];
    const perspective2 = perspectives[Math.floor(Math.random() * perspectives.length)];
    const aspect = aspects[Math.floor(Math.random() * aspects.length)];
    const implication = implications[Math.floor(Math.random() * implications.length)];
    
    return `${perspective1}, ${topic} represents a significant development that warrants careful consideration. 
Understanding its ${aspect} provides valuable insights into both current applications and future potential.

${perspective2}, we can observe how ${topic} has evolved to address specific challenges while creating 
new opportunities. This evolution reflects broader patterns of innovation and adaptation that characterize 
many significant developments.

When considering the ${implication}, we recognize that ${topic} exists within a complex ecosystem of 
related concepts and approaches. This interconnectedness suggests that future developments will likely 
involve increasing integration and cross-pollination of ideas.`;
  },
  
  // Generate a technical explanation
  createTechnical: (topic: string): string => {
    const components = [
      "core architectural elements", "fundamental principles",
      "key operational mechanisms", "integrated subsystems",
      "specialized methodologies"
    ];
    
    const functions = [
      "processing and transforming inputs",
      "optimizing resource allocation",
      "coordinating complex interactions",
      "maintaining system integrity",
      "adapting to changing conditions"
    ];
    
    const advantages = [
      "enhanced efficiency and performance",
      "improved reliability and consistency",
      "greater flexibility and adaptability",
      "reduced complexity and maintenance requirements",
      "better integration with existing systems"
    ];
    
    const component = components[Math.floor(Math.random() * components.length)];
    const function1 = functions[Math.floor(Math.random() * functions.length)];
    const advantage = advantages[Math.floor(Math.random() * advantages.length)];
    
    return `The technical implementation of ${topic} involves several ${component} working in concert.
These are responsible for ${function1}, which is essential for proper functionality. 

Implementation typically requires consideration of various factors including scalability,
performance optimization, and integration capabilities. Each element must be carefully
designed to ensure coherence with the overall architecture.

This approach offers advantages including ${advantage}, though specific implementations
may prioritize different aspects based on particular requirements and constraints.
Optimal results generally depend on thorough understanding of both theoretical principles
and practical limitations.`;
  },
  
  // Generate a creative exploration
  createCreative: (topic: string): string => {
    const concepts = [
      "reimagining possibilities", "challenging conventional boundaries",
      "exploring unexpected connections", "synthesizing diverse elements",
      "transforming fundamental assumptions"
    ];
    
    const approaches = [
      "an approach that values both tradition and innovation",
      "a perspective that embraces apparent contradictions",
      "a framework that adapts to changing circumstances",
      "a methodology that encourages continuous experimentation",
      "a system that evolves through iterative refinement"
    ];
    
    const potentials = [
      "new ways of understanding complex relationships",
      "solutions to previously intractable problems",
      "bridges between seemingly disparate domains",
      "platforms for future innovation and exploration",
      "mechanisms for transformative change"
    ];
    
    const concept = concepts[Math.floor(Math.random() * concepts.length)];
    const approach = approaches[Math.floor(Math.random() * approaches.length)];
    const potential = potentials[Math.floor(Math.random() * potentials.length)];
    
    return `Imagine ${topic} as a catalyst for ${concept}, opening doors to unexplored territories.
Rather than accepting traditional limitations, consider it as ${approach} that invites
us to reconsider fundamental assumptions.

What emerges from this perspective is not merely an incremental improvement, but
a qualitative transformation that generates ${potential}. This creative reframing
allows us to see familiar challenges in new ways and envision possibilities that
might otherwise remain hidden.

The most valuable insights often arise at the intersection of established knowledge
and innovative thinking. By maintaining this creative tension, ${topic} continues to
evolve in ways that both honor its origins and transcend its initial boundaries.`;
  }
};

class TextGenerationService {
  /**
   * Generate text based on a prompt
   */
  async generateText(
    prompt: string, 
    options: {
      maxLength?: number;
      temperature?: number;
      modelType?: string;
      onProgress?: (data: {progress: number, message: string}) => void;
    } = {}
  ): Promise<{generated_text: string; model_info: any}> {
    const { 
      maxLength = 100, 
      temperature = 0.7, 
      modelType = 'default',
      onProgress 
    } = options;
    
    try {
      // Report progress to the UI
      if (onProgress) onProgress({progress: 0.2, message: 'Analyzing prompt...'});
      await this.simulateThinking(300);
      
      // Process the prompt to extract the main topic
      const topic = this.extractTopicFromPrompt(prompt);
      
      if (onProgress) onProgress({progress: 0.4, message: 'Generating content...'});
      await this.simulateThinking(500);
      
      // Generate text based on the prompt style and temperature
      const generatedText = this.generateContentForPrompt(prompt, topic, temperature, maxLength);
      
      if (onProgress) onProgress({progress: 0.7, message: 'Enhancing response...'});
      await this.simulateThinking(400);
      
      // Apply finishing touches
      const finalText = this.finalizeText(generatedText, maxLength);
      
      if (onProgress) onProgress({progress: 0.9, message: 'Finishing up...'});
      await this.simulateThinking(200);
      
      // Format the response
      return {
        generated_text: finalText,
        model_info: {
          name: modelType === 'code' ? 'CreativeCode' : 'FlexText',
          type: "Advanced Text Generation",
          provider: "browser-local",
          parameters: {
            temperature,
            max_length: maxLength
          }
        }
      };
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Extract the main topic from the prompt
   */
  private extractTopicFromPrompt(prompt: string): string {
    // Remove common question words and articles
    const cleanPrompt = prompt.toLowerCase()
      .replace(/^(what|how|why|when|where|who|is|are|can|could|would|should|do|does|did|tell me about|explain|describe)/i, '')
      .replace(/\b(a|an|the|in|on|at|by|for|with|about)\b/g, '')
      .trim();
    
    // If the prompt is empty after cleaning, return the original
    if (!cleanPrompt) {
      return prompt.trim();
    }
    
    // Split into words and filter out very short words
    const words = cleanPrompt.split(/\s+/).filter(word => word.length > 2);
    
    // If no words remain, return the original prompt
    if (words.length === 0) {
      return prompt.trim();
    }
    
    // If it's a very short prompt, use it as is
    if (words.length <= 3) {
      return words.join(' ');
    }
    
    // For longer prompts, try to extract the main subject
    // Very simple approach - in a real system, NLP would be used
    return words.slice(0, 3).join(' ');
  }
  
  /**
   * Determine what kind of content to generate based on the prompt
   */
  private generateContentForPrompt(prompt: string, topic: string, temperature: number, maxLength: number): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Choose generation strategy based on prompt
    if (lowerPrompt.match(/(story|tell|narrative|fiction|creative writing|imagine)/i)) {
      return CONTENT_GENERATORS.createStory(topic);
    }
    
    if (lowerPrompt.match(/(technical|how does it work|mechanism|system|technology|implementation)/i)) {
      return CONTENT_GENERATORS.createTechnical(topic);
    }
    
    if (lowerPrompt.match(/(creative|innovative|unique|novel|reimagine|possibilities)/i)) {
      return CONTENT_GENERATORS.createCreative(topic);
    }
    
    if (lowerPrompt.match(/(analysis|explain|review|examine|study|explore|understand)/i)) {
      return CONTENT_GENERATORS.createAnalysis(topic);
    }
    
    // If no clear pattern, choose based on temperature
    // Higher temperature = more creative output
    if (temperature > 0.7) {
      return CONTENT_GENERATORS.createCreative(topic);
    } else if (temperature > 0.4) {
      return CONTENT_GENERATORS.createAnalysis(topic);
    } else {
      return CONTENT_GENERATORS.createTechnical(topic);
    }
  }
  
  /**
   * Apply finishing touches to the generated text
   */
  private finalizeText(text: string, maxLength: number): string {
    // Truncate if too long, being careful not to cut in the middle of a sentence
    if (text.length > maxLength * 4) {
      const truncated = text.substring(0, maxLength * 4);
      const lastPeriod = truncated.lastIndexOf('.');
      
      if (lastPeriod > truncated.length * 0.7) {
        return truncated.substring(0, lastPeriod + 1);
      }
      return truncated;
    }
    
    return text;
  }
  
  /**
   * Simulate thinking time to make the interaction feel more natural
   */
  private async simulateThinking(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Preload the default model (no-op in this simplified version)
   */
  preloadDefaultModel(): void {
    console.log('Text generation system ready');
    return;
  }
}

export default new TextGenerationService(); 