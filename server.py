import http.server
import socketserver
import os
import mimetypes

PORT = 8000

class FastHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow caching for static media (videos, images, fonts) for instant page loads
        path = self.translate_path(self.path)
        if any(path.endswith(ext) for ext in ['.mp4', '.jpg', '.jpeg', '.png', '.webp', '.woff', '.woff2', '.ttf', '.css', '.js']):
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadedHTTPServer(('', PORT), FastHTTPRequestHandler)
    print(f'Serving ultra-fast multi-threaded HTTP on port {PORT}...')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
