import http.server
import socketserver
import urllib.parse
import subprocess
import json

PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        
        if parsed_path.path == '/api/weather':
            query_components = urllib.parse.parse_qs(parsed_path.query)
            city = query_components.get('city', [''])[0]
            
            if city:
                try:
                    # Call the C++ executable
                    result = subprocess.run(['.\\weather_app.exe', '--json', city], 
                                            capture_output=True, text=True, check=True, encoding='utf-8')
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(result.stdout.encode('utf-8'))
                except Exception as e:
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': str(e)}).encode())
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error": "City parameter is missing"}')
                
        elif parsed_path.path == '/api/history':
            try:
                result = subprocess.run(['.\\weather_app.exe', '--history'], 
                                        capture_output=True, text=True, check=True, encoding='utf-8')
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(result.stdout.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            # Serve static files for any other path (index.html, style.css, etc.)
            super().do_GET()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()
