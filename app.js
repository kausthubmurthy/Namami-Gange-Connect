// Application Data
const appData = {
  namami_gange_facts: {
    launch_year: "2014",
    budget: "₹20,000+ crore",
    states_covered: 8,
    projects_sanctioned: 344,
    projects_completed: 147,
    main_objectives: [
      "Sewerage treatment infrastructure",
      "River-front development", 
      "Biodiversity conservation",
      "River-people connect",
      "Pollution abatement",
      "Industrial effluent monitoring"
    ]
  },
  chacha_chaudhary_info: {
    creator: "Pran Kumar Sharma",
    first_appearance: "1971",
    languages: 10,
    copies_sold: "10+ million",
    signature_features: ["Red turban", "White mustache", "Wisdom", "Problem-solving"],
    famous_quote: "Chacha Chaudhary ka dimag computer se bhi tez chalta hai"
  },
  ai_ml_concepts: {
    nlp_capabilities: ["Multilingual support", "Context understanding", "Sentiment analysis", "Named entity recognition"],
    ml_features: ["Personalized responses", "Learning from interactions", "Pattern recognition", "Predictive text"],
    technologies: ["PyTorch", "TensorFlow", "Unity 3D", "React.js", "MongoDB", "Cloud infrastructure"]
  },
  conservation_tips: [
    "Avoid throwing plastic in rivers",
    "Use eco-friendly products",
    "Participate in river cleaning drives", 
    "Report pollution to authorities",
    "Conserve water in daily use",
    "Plant trees along riverbanks",
    "Spread awareness in community"
  ],
  river_facts: [
    "Ganga is 2,525 km long",
    "Flows through 5 states in India",
    "Sacred to 1 billion+ people",
    "Supports 400+ million people",
    "Home to endangered Ganges dolphins",
    "Source: Gangotri Glacier"
  ],
  quick_responses: {
    about_namami_gange: "Namaste! I'm Chacha Chaudhary, your friendly guide for the Namami Gange program. This is a ₹20,000+ crore initiative launched in 2014 to clean and rejuvenate our sacred River Ganga. We're working on sewerage treatment, biodiversity conservation, and strengthening the bond between rivers and people!",
    ai_technology: "My AI brain works faster than a computer! I use Natural Language Processing to understand multiple languages, Machine Learning to give personalized responses, and advanced algorithms to help educate people about river conservation. The technology includes speech recognition, sentiment analysis, and smart conversation management.",
    how_to_help: "There are many ways you can help! Join river cleaning drives, avoid throwing plastic in rivers, use eco-friendly products, conserve water, plant trees along riverbanks, and spread awareness in your community. Every small action counts in saving our rivers!",
    ganga_importance: "River Ganga is not just a river - it's our lifeline! It flows 2,525 km through 5 states, supports 400+ million people, and is sacred to over 1 billion people. It's home to endangered Ganges dolphins and has immense cultural and spiritual significance for India."
  }
};

// Chatbot Class
class ChachaChatbot {
  constructor() {
    this.initializeElements();
    this.conversationContext = [];
    this.isTyping = false;
    this.apiBase = 'http://localhost:8000';
    this.init();
  }
  
  initializeElements() {
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.quickButtons = document.querySelectorAll('.quick-btn');
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.infoSections = document.querySelectorAll('.info-section');
    
    console.log('Elements initialized:', {
      chatMessages: !!this.chatMessages,
      chatInput: !!this.chatInput,
      sendButton: !!this.sendButton,
      typingIndicator: !!this.typingIndicator,
      quickButtons: this.quickButtons.length,
      tabButtons: this.tabButtons.length,
      infoSections: this.infoSections.length
    });
  }
  
  init() {
    this.setupEventListeners();
    // Add a small delay before showing welcome message
    setTimeout(() => {
      this.showWelcomeMessage();
    }, 500);
  }
  
  setupEventListeners() {
    // Send button and Enter key
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => {
        console.log('Send button clicked');
        this.handleUserMessage();
      });
    }
    
    if (this.chatInput) {
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          console.log('Enter key pressed');
          this.handleUserMessage();
        }
      });
    }
    
    // Quick action buttons
    this.quickButtons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        console.log(`Quick button ${index} clicked`);
        const topic = e.target.getAttribute('data-topic');
        console.log(`Topic: ${topic}`);
        this.handleQuickAction(topic);
      });
    });
    
    // Info panel tabs
    this.tabButtons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        console.log(`Tab button ${index} clicked`);
        const sectionId = e.target.getAttribute('data-section');
        console.log(`Section ID: ${sectionId}`);
        this.switchInfoSection(sectionId);
      });
    });
    
    console.log('Event listeners set up successfully');
  }
  
  showWelcomeMessage() {
    const welcomeMessage = "🙏 Namaste! Main Chacha Chaudhary hun! Welcome to Namami Gange AI Assistant. I'm here to help you learn about river conservation, AI technology, and how we can protect our sacred River Ganga together. Feel free to ask me anything or use the quick buttons below! 🌊";
    this.addMessage(welcomeMessage, 'bot');
  }
  
  handleUserMessage() {
    if (!this.chatInput) return;
    
    const message = this.chatInput.value.trim();
    if (!message || this.isTyping) return;
    
    this.addMessage(message, 'user');
    this.chatInput.value = '';
    this.processUserMessage(message);
  }
  
  handleQuickAction(topic) {
    console.log(`Handling quick action: ${topic}`);
    console.log(`Is typing: ${this.isTyping}`);
    
    if (this.isTyping) return;
    
    const response = appData.quick_responses[topic];
    console.log(`Response found: ${!!response}`);
    
    if (response) {
      this.showTypingIndicator();
      
      // Use a more reliable setTimeout approach
      const timeoutId = setTimeout(() => {
        console.log('Quick action timeout executed');
        this.hideTypingIndicator();
        this.addMessage(response, 'bot');
        this.conversationContext.push({ topic, response });
      }, 1200);
      
      console.log(`Timeout set with ID: ${timeoutId}`);
    } else {
      console.error(`No response found for topic: ${topic}`);
    }
  }
  
  processUserMessage(message) {
    this.showTypingIndicator();
    // Try backend first; if it fails, fallback to on-device rule-based response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch(`${this.apiBase}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, top_k: 3 }),
      signal: controller.signal
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => {
        this.hideTypingIndicator();
        const answer = data && data.answer ? data.answer : this.generateResponse(message);
        const suffix = data && data.sources && data.sources.length
          ? `\n\nSources: ${data.sources.slice(0,3).join(', ')}`
          : '';
        this.addMessage(answer + suffix, 'bot');
        this.conversationContext.push({ user: message, bot: answer, backend: true });
      })
      .catch(() => {
        const response = this.generateResponse(message);
        const delay = 400 + Math.random() * 600;
        setTimeout(() => {
          this.hideTypingIndicator();
          this.addMessage(response, 'bot');
          this.conversationContext.push({ user: message, bot: response, backend: false });
        }, delay);
      })
      .finally(() => clearTimeout(timeoutId));
  }
  
  generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greetings
    if (this.matchKeywords(lowerMessage, ['hello', 'hi', 'namaste', 'hey', 'hola'])) {
      return "🙏 Namaste! I'm Chacha Chaudhary. How can I help you learn about river conservation and the Namami Gange program today?";
    }
    
    // Namami Gange related queries
    if (this.matchKeywords(lowerMessage, ['namami gange', 'ganga', 'river cleaning', 'budget', 'program'])) {
      return `The Namami Gange program is our flagship initiative! Launched in ${appData.namami_gange_facts.launch_year} with a budget of ${appData.namami_gange_facts.budget}, we're working across ${appData.namami_gange_facts.states_covered} states. We have ${appData.namami_gange_facts.projects_sanctioned} projects sanctioned and ${appData.namami_gange_facts.projects_completed} already completed! Our main focus is on sewerage treatment, biodiversity conservation, and connecting people with rivers. 🏛️`;
    }
    
    // AI Technology queries
    if (this.matchKeywords(lowerMessage, ['ai', 'artificial intelligence', 'machine learning', 'technology', 'computer'])) {
      return `${appData.chacha_chaudhary_info.famous_quote}! My AI capabilities include multilingual support, context understanding, and personalized responses. I use technologies like ${appData.ai_ml_concepts.technologies.slice(0, 3).join(', ')} to provide smart conversations about river conservation. I can learn from our interactions and help educate people more effectively! 🤖`;
    }
    
    // Conservation and Help
    if (this.matchKeywords(lowerMessage, ['help', 'conservation', 'protect', 'save', 'environment', 'tips'])) {
      const tips = appData.conservation_tips.slice(0, 3);
      return `Here are some ways you can help protect our rivers: ${tips.map(tip => `• ${tip}`).join(' ')}. Remember, every small action makes a big difference in river conservation! 🌱`;
    }
    
    // River Ganga facts
    if (this.matchKeywords(lowerMessage, ['ganga facts', 'river facts', 'ganga length', 'sacred', 'spiritual'])) {
      const facts = appData.river_facts.slice(0, 3);
      return `Here are some amazing facts about River Ganga: ${facts.join(', ')}. It's not just a river, it's the lifeline of our civilization! 🏞️`;
    }
    
    // About Chacha Chaudhary
    if (this.matchKeywords(lowerMessage, ['chacha chaudhary', 'about you', 'who are you', 'character'])) {
      return `I am Chacha Chaudhary! Created by ${appData.chacha_chaudhary_info.creator} in ${appData.chacha_chaudhary_info.first_appearance}, I've been solving problems for over 50 years! Published in ${appData.chacha_chaudhary_info.languages} languages with ${appData.chacha_chaudhary_info.copies_sold} copies sold. My brain works faster than a computer, and now I'm here to help save our rivers! 👨‍🦳`;
    }
    
    // Pollution related
    if (this.matchKeywords(lowerMessage, ['pollution', 'waste', 'plastic', 'industrial', 'sewage'])) {
      return "Pollution is our biggest enemy! Industrial waste, plastic, and untreated sewage are major threats to our rivers. Through Namami Gange, we're setting up sewage treatment plants, monitoring industrial effluents, and creating awareness about plastic-free rivers. Report any pollution you see to local authorities! 🚫";
    }
    
    // Technology and features
    if (this.matchKeywords(lowerMessage, ['features', 'nlp', 'capabilities', 'smart'])) {
      return `My advanced features include ${appData.ai_ml_concepts.nlp_capabilities.join(', ')}, and ${appData.ai_ml_concepts.ml_features.join(', ')}. I'm designed to make learning about river conservation fun and interactive! 🧠`;
    }
    
    // Community engagement
    if (this.matchKeywords(lowerMessage, ['community', 'participate', 'volunteer', 'join'])) {
      return "Great to see your enthusiasm! You can join river cleaning drives, participate in awareness campaigns, volunteer for tree plantation, organize educational sessions in your community, and use social media to spread conservation messages. Together we can make our rivers clean! 👥";
    }
    
    // Biodiversity
    if (this.matchKeywords(lowerMessage, ['dolphins', 'fish', 'wildlife', 'biodiversity', 'animals'])) {
      return "River Ganga is home to amazing wildlife! The endangered Ganges river dolphins are our special residents. The river ecosystem supports hundreds of fish species, aquatic plants, and birds. Protecting river biodiversity is crucial for maintaining ecological balance! 🐬";
    }
    
    // Cultural significance
    if (this.matchKeywords(lowerMessage, ['culture', 'religious', 'spiritual', 'heritage', 'tradition'])) {
      return "River Ganga holds immense cultural and spiritual significance for over 1 billion people! It's mentioned in our ancient texts, is central to Hindu traditions, and represents purity and life. Preserving Ganga means preserving our cultural heritage for future generations! 🕉️";
    }
    
    // Thank you responses
    if (this.matchKeywords(lowerMessage, ['thank', 'thanks', 'dhanyawad', 'appreciate'])) {
      return "You're most welcome! It's my pleasure to help spread awareness about river conservation. Remember, protecting our rivers is protecting our future. Keep learning and keep contributing! 🙏";
    }
    
    // Goodbye responses
    if (this.matchKeywords(lowerMessage, ['bye', 'goodbye', 'see you', 'alvida'])) {
      return "Goodbye! Remember to spread awareness about river conservation in your community. May River Ganga bless you! Come back anytime you need guidance on protecting our precious rivers. 👋";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question! While I specialize in river conservation and AI technology, I'm always learning. Can you tell me more about what specific aspect you'd like to know?",
      "My expertise is in Namami Gange program and river conservation. Could you rephrase your question so I can help you better? 🤔",
      "I'd love to help! Try asking me about river conservation, Namami Gange program, AI technology, or use the quick action buttons for popular topics!",
      "As Chacha Chaudhary, I'm here to guide you on river conservation matters. What would you like to learn about protecting our precious rivers? 🌊"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  matchKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }
  
  addMessage(text, type) {
    if (!this.chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'bot' ? '🧓' : '👤';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    content.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }
  
  showTypingIndicator() {
    console.log('Showing typing indicator');
    this.isTyping = true;
    if (this.typingIndicator) {
      this.typingIndicator.classList.remove('hidden');
    }
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    console.log('Hiding typing indicator');
    this.isTyping = false;
    if (this.typingIndicator) {
      this.typingIndicator.classList.add('hidden');
    }
  }
  
  scrollToBottom() {
    if (!this.chatMessages) return;
    
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }
  
  switchInfoSection(sectionId) {
    console.log(`Switching to section: ${sectionId}`);
    
    // Hide all sections
    this.infoSections.forEach((section, index) => {
      console.log(`Section ${index}: ${section.id}, removing active`);
      section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    this.tabButtons.forEach((btn, index) => {
      console.log(`Tab ${index}: removing active`);
      btn.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
      console.log(`Found section ${sectionId}, adding active`);
      selectedSection.classList.add('active');
    } else {
      console.error(`Section not found: ${sectionId}`);
    }
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`[data-section="${sectionId}"]`);
    if (selectedTab) {
      console.log(`Found tab for ${sectionId}, adding active`);
      selectedTab.classList.add('active');
    } else {
      console.error(`Tab not found for section: ${sectionId}`);
    }
  }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing chatbot...');
  
  try {
    const chatbot = new ChachaChatbot();
    console.log('Chatbot initialized successfully');
    
    // Add some interactive features
    document.addEventListener('keydown', (e) => {
      // Focus chat input when user starts typing (except when focused on other inputs)
      if (e.target === document.body && e.key.match(/[a-zA-Z0-9]/)) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
          chatInput.focus();
        }
      }
    });
    
    // Add visual feedback for interactions
    document.querySelectorAll('.btn, .quick-btn, .tab-btn').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.target.style.transform = 'scale(0.95)';
      });
      
      btn.addEventListener('mouseup', (e) => {
        setTimeout(() => {
          e.target.style.transform = '';
        }, 150);
      });
    });
    
  } catch (error) {
    console.error('Error initializing chatbot:', error);
  }
});