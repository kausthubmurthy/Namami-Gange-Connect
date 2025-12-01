#!/usr/bin/env python3
"""
Enhanced Web Server for Chacha Chaudhary AI Chatbot Frontend
Serves the frontend files with proper MIME types and CORS headers
"""

import http.server
import socketserver
import os
import mimetypes
import webbrowser
from pathlib import Path

class EnhancedHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Enhanced HTTP request handler with CORS support"""
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def guess_type(self, path):
        """Enhanced MIME type guessing"""
        mimetype, encoding = mimetypes.guess_type(path)
        if mimetype is None:
            if path.endswith('.js'):
                return 'application/javascript'
            elif path.endswith('.css'):
                return 'text/css'
            elif path.endswith('.html'):
                return 'text/html'
        return mimetype

def start_frontend_server(port=5173, directory=None):
    """Start the frontend server"""
    
    if directory:
        os.chdir(directory)
    
    # Configure MIME types for better browser compatibility
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')
    
    with socketserver.TCPServer(("", port), EnhancedHTTPRequestHandler) as httpd:
        print("🌐 Enhanced Frontend Server Starting...")
        print(f"📁 Serving directory: {os.getcwd()}")
        print(f"🚀 Server running at: http://localhost:{port}")
        print("✅ CORS enabled for cross-origin requests")
        print("🎯 Access your Chacha Chaudhary AI Chatbot!")
        print("\n" + "="*50)
        
        try:
            # Try to open browser automatically
            webbrowser.open(f"http://localhost:{port}")
            print("🌍 Browser opened automatically!")
        except:
            print("🌍 Please open your browser and visit the URL above")
        
        print("="*50)
        print("🛑 Press Ctrl+C to stop the server")
        print("="*50 + "\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            print("👋 Goodbye!")

if __name__ == "__main__":
    # Change to the project directory
    project_dir = "/Users/kausthubmurthy/Documents/Visual Studio Code/Capstone"
    start_frontend_server(port=5173, directory=project_dir)