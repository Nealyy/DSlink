from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import requests
from urllib.parse import parse_qs

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        # API配置
        api_url = 'https://cloud.siliconflow.cn/v1/chat/completions'
        api_key = 'sk-aibppdtsbhpmkmetxgpfydwwsdkyvlslgaojzqtqmfuawgzu'

        # 准备请求数据
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }

        try:
            # 发送请求到API
            response = requests.post(api_url, json=data, headers=headers)
            
            # 设置响应头
            self._set_headers()
            
            # 发送响应
            self.wfile.write(json.dumps(response.json()).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
