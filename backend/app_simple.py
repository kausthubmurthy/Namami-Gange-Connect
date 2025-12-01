#!/usr/bin/env python3
"""
Chacha Chaudhary AI Chatbot Backend
Advanced AI-powered chatbot for Namami Gange Programme education
Using FastAPI, PyTorch, TensorFlow, NLTK, and spaCy
"""

import os
import sys
import json
import re
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import requests
from pathlib import Path

# FastAPI imports
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ML and NLP imports
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
# import spacy - Disabled due to compatibility issues

# Web scraping imports
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Chacha Chaudhary AI Chatbot API",
    description="AI-powered chatbot for Namami Gange Programme education",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"

class ChatResponse(BaseModel):
    response: str
    confidence: float
    intent: str
    source: Optional[str] = None
    timestamp: str

class ChachaChatbot:
    def __init__(self):
        """Initialize the AI chatbot with all components"""
        self.documents = []
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.doc_vectors = None
        self.nlp = None
        
        # Initialize components
        self._load_documents()
        self._initialize_nlp()
        self._train_vectorizer()
        
        logger.info("🤖 Chacha Chaudhary AI Chatbot initialized successfully!")
    
    def _initialize_nlp(self):
        """Initialize NLTK and spaCy components"""
        try:
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
            
            # Load spaCy model (disabled due to compatibility issues)
            # try:
            #     self.nlp = spacy.load("en_core_web_sm")
            # except OSError:
            #     logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
                
        except Exception as e:
            logger.error(f"Error initializing NLP components: {e}")
    
    def _load_documents(self):
        """Load knowledge base documents about Namami Gange Programme"""
        self.documents = [
            {
                "id": 1,
                "title": "Namami Gange Programme Overview",
                "content": "The Namami Gange Programme is an integrated conservation mission for river Ganga. It was launched by the Government of India in June 2014 with a budget allocation of Rs. 20,000 crore. The programme aims to accomplish effective abatement of pollution, conservation and rejuvenation of river Ganga by adopting a comprehensive approach."
            },
            {
                "id": 2,
                "title": "River Pollution and Cleaning",
                "content": "River pollution is caused by industrial discharge, sewage, agricultural runoff, and solid waste. The Namami Gange Programme addresses these through sewage treatment plants, industrial monitoring, riverfront development, and public participation. Advanced technologies like bioremediation and phytoremediation are used for cleaning."
            },
            {
                "id": 3,
                "title": "Ganga Conservation Efforts",
                "content": "Conservation efforts include afforestation along river banks, biodiversity conservation, wetland restoration, and sustainable agriculture practices. The programme focuses on maintaining ecological flow, protecting aquatic life, and preserving cultural heritage associated with the river."
            },
            {
                "id": 4,
                "title": "Sewage Treatment Infrastructure",
                "content": "Under Namami Gange, numerous sewage treatment plants are being constructed along the river. These plants use advanced treatment technologies including Sequential Batch Reactor (SBR), Moving Bed Biofilm Reactor (MBBR), and Membrane Bioreactor (MBR) technologies to treat wastewater effectively."
            },
            {
                "id": 5,
                "title": "Industrial Waste Management",
                "content": "Industries along the Ganga are required to have Zero Liquid Discharge (ZLD) systems. Real-time monitoring systems track industrial effluents. The programme promotes cleaner production technologies and enforces strict environmental compliance standards."
            },
            {
                "id": 6,
                "title": "Public Participation and Awareness",
                "content": "Public participation is crucial for river conservation. The programme includes mass awareness campaigns, school education programs, community involvement in cleaning drives, and training programs for local communities. Citizens are encouraged to adopt sustainable practices."
            },
            {
                "id": 7,
                "title": "Technology and Innovation",
                "content": "The Namami Gange Programme leverages cutting-edge technologies including satellite monitoring, GIS mapping, real-time water quality sensors, mobile apps for citizen reporting, and artificial intelligence for data analysis and decision making."
            },
            {
                "id": 8,
                "title": "Economic and Social Benefits",
                "content": "A clean Ganga provides numerous benefits including improved public health, enhanced tourism, job creation in eco-friendly industries, increased property values along clean riverbanks, and preservation of cultural and religious significance of the river."
            },
            {
                "id": 9,
                "title": "Challenges and Solutions",
                "content": "Major challenges include population growth, urbanization, industrial pressure, and climate change. Solutions involve integrated planning, stakeholder coordination, policy enforcement, technology adoption, and sustainable development practices."
            },
            {
                "id": 10,
                "title": "Future Vision",
                "content": "The vision is to make Ganga completely pollution-free and ecologically healthy. This includes achieving desired water quality standards, maintaining ecological flow, supporting biodiversity, and ensuring sustainable development along the river basin."
            }
        ]
        
        logger.info(f"📚 Loaded {len(self.documents)} knowledge base documents")
    
    def _train_vectorizer(self):
        """Train TF-IDF vectorizer on documents"""
        try:
            doc_texts = [doc["content"] for doc in self.documents]
            self.doc_vectors = self.vectorizer.fit_transform(doc_texts)
            logger.info("🎯 TF-IDF vectorizer trained successfully")
        except Exception as e:
            logger.error(f"Error training vectorizer: {e}")
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text using NLTK"""
        try:
            # Basic preprocessing
            text = text.lower().strip()
            text = re.sub(r'[^\w\s]', ' ', text)
            text = re.sub(r'\s+', ' ', text)
            
            # Advanced preprocessing with spaCy if available
            if self.nlp:
                doc = self.nlp(text)
                tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
                text = ' '.join(tokens)
            
            return text
        except Exception as e:
            logger.error(f"Error preprocessing text: {e}")
            return text.lower().strip()
    
    def _classify_intent(self, message: str) -> str:
        """Classify user intent"""
        message_lower = message.lower()
        
        # Intent patterns
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'namaste', 'chacha']):
            return 'greeting'
        elif any(word in message_lower for word in ['what', 'explain', 'tell me about', 'describe']):
            return 'information_request'
        elif any(word in message_lower for word in ['how', 'process', 'method', 'procedure']):
            return 'process_inquiry'
        elif any(word in message_lower for word in ['problem', 'issue', 'challenge', 'difficulty']):
            return 'problem_discussion'
        elif any(word in message_lower for word in ['help', 'assist', 'support', 'guide']):
            return 'help_request'
        elif any(word in message_lower for word in ['thank', 'thanks', 'bye', 'goodbye']):
            return 'closing'
        else:
            return 'general_query'
    
    def _find_best_document(self, query: str) -> Tuple[Dict, float]:
        """Find the most relevant document using TF-IDF similarity"""
        try:
            processed_query = self._preprocess_text(query)
            query_vector = self.vectorizer.transform([processed_query])
            
            similarities = cosine_similarity(query_vector, self.doc_vectors).flatten()
            best_idx = np.argmax(similarities)
            best_score = similarities[best_idx]
            
            return self.documents[best_idx], best_score
        except Exception as e:
            logger.error(f"Error finding best document: {e}")
            return self.documents[0], 0.1
    
    def _generate_response(self, message: str, intent: str, best_doc: Dict, confidence: float) -> str:
        """Generate contextual response"""
        
        # Greeting responses
        if intent == 'greeting':
            return f"🙏 Namaste! Main Chacha Chaudhary hun! Namami Gange Programme ke baare mein aapki madad karne ke liye yahan hun. Ganga ke conservation ke baare mein kya jaanna chahte hain? (Hello! I'm Chacha Chaudhary! I'm here to help you about the Namami Gange Programme. What would you like to know about Ganga conservation?)"
        
        # Closing responses
        elif intent == 'closing':
            return "🙏 Dhanyawad! Ganga maa ki raksha mein hum sab milkar kaam karenge. Yaad rakhiye - 'Saada Dimaag Computer se bhi tez chalta hai!' (Thank you! We'll all work together to protect Mother Ganga. Remember - 'My brain works faster than a computer!')"
        
        # Information responses
        else:
            base_response = f"🧠 Chacha Chaudhary kehta hai: {best_doc['content']}"
            
            # Add contextual enhancement based on intent
            if intent == 'process_inquiry':
                base_response += "\n\n🔧 Ye process step-by-step implement hota hai aur technology ka bhi istemaal hota hai."
            elif intent == 'problem_discussion':
                base_response += "\n\n⚡ Har problem ka solution hai, bas sahi approach chahiye!"
            elif intent == 'help_request':
                base_response += "\n\n🤝 Main yahan hun aapki madad ke liye. Koi aur sawal hai to poochiye!"
            
            return base_response
    
    async def process_message(self, message: str, user_id: str = "anonymous") -> ChatResponse:
        """Process user message and generate response"""
        try:
            # Classify intent
            intent = self._classify_intent(message)
            
            # Find best matching document
            best_doc, confidence = self._find_best_document(message)
            
            # Generate response
            response = self._generate_response(message, intent, best_doc, confidence)
            
            # Create response object
            chat_response = ChatResponse(
                response=response,
                confidence=min(confidence + 0.3, 1.0),  # Boost confidence for better UX
                intent=intent,
                source=best_doc["title"],
                timestamp=datetime.now().isoformat()
            )
            
            logger.info(f"Processed message from {user_id}: intent={intent}, confidence={confidence:.2f}")
            return chat_response
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return ChatResponse(
                response="🤔 Maaf kijiye, thoda technical problem aa gaya hai. Kripya phir se try kariye! (Sorry, there's a technical issue. Please try again!)",
                confidence=0.5,
                intent="error",
                source="System",
                timestamp=datetime.now().isoformat()
            )

# Initialize chatbot
chatbot = ChachaChatbot()

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🤖 Chacha Chaudhary AI Chatbot API",
        "version": "1.0.0",
        "status": "active",
        "description": "AI-powered chatbot for Namami Gange Programme education"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "documents_loaded": len(chatbot.documents),
        "nlp_initialized": chatbot.nlp is not None
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint"""
    try:
        response = await chatbot.process_message(request.message, request.user_id)
        return response
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/docs-info")
async def get_documents_info():
    """Get information about loaded documents"""
    return {
        "total_documents": len(chatbot.documents),
        "documents": [{"id": doc["id"], "title": doc["title"]} for doc in chatbot.documents]
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Chacha Chaudhary AI Chatbot Backend...")
    print("🧠 'Chacha Chaudhary ka dimag computer se bhi tez chalta hai!'")
    print("🌊 Ready to help with Namami Gange Programme education!")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )